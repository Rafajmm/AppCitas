const { Inject, Injectable } = require('@nestjs/common');
const nodemailer = require('nodemailer');
const { EmailRepository } = require('./email.repository');

class EmailService {
  constructor(emailRepository) {
    this.emailRepository = emailRepository;
  }

  getTransport() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) return null;

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async sendBookingConfirmationEmail({ negocio, cita, toEmail }, options = {}) {
    const { skipLogging = false } = options;
    
    console.log('📧 Sending booking confirmation email:', {
      negocio: negocio.nombre,
      citaId: cita.id,
      toEmail,
      hasTransport: !!this.getTransport()
    });

    const transport = this.getTransport();

    const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    const confirmUrl = `${appBaseUrl}/${negocio.slug}/confirm/${cita.token_confirmacion}`;

    const subject = `Confirma tu cita en ${negocio.nombre}`;
    const text = `Hola ${cita.nombre_cliente},\n\nHas solicitado una cita en ${negocio.nombre}.\n\nFecha: ${cita.fecha}\nHora: ${String(cita.hora_inicio).slice(0,5)}\n\nConfirma tu cita aquí: ${confirmUrl}\n\nSi no solicitaste esta cita, ignora este mensaje.`;

    try {
      if (!toEmail) {
        console.log('❌ No email provided, logging failed email');
        if (!skipLogging) {
          await this.emailRepository.logEmail({
            negocioId: negocio.id,
            citaId: cita.id,
            destinatario: '(sin email)',
            asunto: subject,
            tipo: 'confirmacion_cita',
            estado: 'fallido',
            errorMensaje: 'Client email missing',
          });
        }
        return { sent: false, reason: 'missing_email' };
      }

      if (!transport) {
        console.log('❌ SMTP not configured, logging failed email');
        if (!skipLogging) {
          await this.emailRepository.logEmail({
            negocioId: negocio.id,
            citaId: cita.id,
            destinatario: toEmail,
            asunto: subject,
            tipo: 'confirmacion_cita',
            estado: 'pendiente',
            errorMensaje: 'SMTP not configured',
          });
        }
        return { sent: false, reason: 'smtp_not_configured', confirmUrl };
      }

      console.log('📤 Attempting to send email via SMTP...');
      const result = await transport.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: toEmail,
        subject,
        text,
      });

      console.log('✅ Email sent successfully:', result);
      
      if (!skipLogging) {
        await this.emailRepository.logEmail({
          negocioId: negocio.id,
          citaId: cita.id,
          destinatario: toEmail,
          asunto: subject,
          tipo: 'confirmacion_cita',
          estado: 'enviado',
        });
      }

      return { sent: true };
    } catch (err) {
      console.error('❌ Email sending failed:', err);
      if (!skipLogging) {
        await this.emailRepository.logEmail({
          negocioId: negocio.id,
          citaId: cita.id,
          destinatario: toEmail || '(sin email)',
          asunto: subject,
          tipo: 'confirmacion_cita',
          estado: 'fallido',
          errorMensaje: String(err && err.message ? err.message : err),
        });
      }
      return { sent: false, reason: 'send_failed' };
    }
  }
}

Injectable()(EmailService);
Inject(EmailRepository)(EmailService, undefined, 0);

module.exports = { EmailService };
