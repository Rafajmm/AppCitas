const { Inject, Injectable } = require('@nestjs/common');
const nodemailer = require('nodemailer');
const { EmailRepository } = require('./email.repository');

class EmailService {
  constructor(emailRepository) {
    this.emailRepository = emailRepository;
  }

  parseDateOnly(dateLike) {
    if (!dateLike) return null;
    if (dateLike instanceof Date) return dateLike;
    if (typeof dateLike === 'string') {
      const m = dateLike.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) {
        const year = Number(m[1]);
        const month = Number(m[2]);
        const day = Number(m[3]);
        return new Date(year, month - 1, day);
      }
      const d = new Date(dateLike);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return null;
  }

  formatDateEs(dateLike) {
    const d = this.parseDateOnly(dateLike);
    if (!d) return String(dateLike);
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
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
    const cancelUrl = `${appBaseUrl}/${negocio.slug}/cancel/${cita.token_cancelacion}`;
    const fechaFormateadaES = this.formatDateEs(cita.fecha);

    const subject = `Confirma tu cita en ${negocio.nombre}`;
    const text = `Hola ${cita.nombre_cliente},\n\nHas solicitado una cita en ${negocio.nombre}.\n\nFecha: ${fechaFormateadaES}\nHora: ${String(cita.hora_inicio).slice(0,5)}\n\nConfirmar cita: ${confirmUrl}\nCancelar cita: ${cancelUrl}\n\nSi no solicitaste esta cita, ignora este mensaje.`;

    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;font-family:Arial,sans-serif;line-height:1.6;color:#111827;background-color:#f3f4f6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:24px 24px 8px 24px;text-align:center;">
                <div style="font-size:20px;font-weight:700;color:#111827;">${negocio.nombre}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 24px 16px 24px;">
                <div style="font-size:16px;color:#111827;">Hola <strong>${cita.nombre_cliente}</strong>,</div>
                <div style="margin-top:10px;font-size:14px;color:#374151;">Has solicitado una cita. Por favor, confirma o cancela tu reserva:</div>
                <div style="margin-top:14px;padding:12px;border-radius:6px;background-color:#f9fafb;border:1px solid #e5e7eb;">
                  <div style="font-size:14px;color:#111827;"><strong>Fecha:</strong> ${fechaFormateadaES}</div>
                  <div style="font-size:14px;color:#111827;"><strong>Hora:</strong> ${String(cita.hora_inicio).slice(0, 5)}</div>
                </div>
                <table role="presentation" style="margin:20px 0;width:100%;" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="padding:0;">
                      <table role="presentation" cellspacing="0" cellpadding="0" style="display:inline-block;margin:0 8px 8px 0;">
                        <tr>
                          <td style="padding:12px 24px;background-color:#10B981;border-radius:6px;text-align:center;">
                            <a href="${confirmUrl}" style="color:#ffffff;text-decoration:none;font-weight:bold;display:inline-block;">Confirmar Cita</a>
                          </td>
                        </tr>
                      </table>
                      <table role="presentation" cellspacing="0" cellpadding="0" style="display:inline-block;margin:0 0 8px 0;">
                        <tr>
                          <td style="padding:12px 24px;background-color:#EF4444;border-radius:6px;text-align:center;">
                            <a href="${cancelUrl}" style="color:#ffffff;text-decoration:none;font-weight:bold;display:inline-block;">Cancelar Cita</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:8px;font-size:12px;color:#6b7280;">Si no solicitaste esta cita, ignora este mensaje.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

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
        html,
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

  async sendBookingReminderEmail({ negocio, cita, toEmail }, options = {}) {
    const { skipLogging = false } = options;

    console.log('📧 Sending booking reminder email:', {
      negocio: negocio.nombre,
      citaId: cita.id,
      toEmail,
      hasTransport: !!this.getTransport(),
    });

    const transport = this.getTransport();

    const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    const cancelUrl = `${appBaseUrl}/${negocio.slug}/cancel/${cita.token_cancelacion}`;
    const fechaFormateadaES = this.formatDateEs(cita.fecha);

    const subject = `Recordatorio: tu cita en ${negocio.nombre} es mañana`;
    const text = `Hola ${cita.nombre_cliente},\n\nTe recordamos que tienes una cita en ${negocio.nombre} dentro de 24 horas.\n\nFecha: ${fechaFormateadaES}\nHora: ${String(cita.hora_inicio).slice(0,5)}\n\nCancelar cita: ${cancelUrl}\n\nSi no solicitaste esta cita, por favor contacta con el negocio.`;

    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;font-family:Arial,sans-serif;line-height:1.6;color:#111827;background-color:#f3f4f6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:24px 24px 8px 24px;text-align:center;">
                <div style="font-size:20px;font-weight:700;color:#111827;">${negocio.nombre}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 24px 16px 24px;">
                <div style="font-size:16px;color:#111827;">Hola <strong>${cita.nombre_cliente}</strong>,</div>
                <div style="margin-top:10px;font-size:14px;color:#374151;">Te recordamos que tienes una cita dentro de 24 horas.</div>
                <div style="margin-top:14px;padding:12px;border-radius:6px;background-color:#f9fafb;border:1px solid #e5e7eb;">
                  <div style="font-size:14px;color:#111827;"><strong>Fecha:</strong> ${fechaFormateadaES}</div>
                  <div style="font-size:14px;color:#111827;"><strong>Hora:</strong> ${String(cita.hora_inicio).slice(0, 5)}</div>
                </div>
                <table role="presentation" style="margin:20px 0;width:100%;" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="padding:0;">
                      <table role="presentation" cellspacing="0" cellpadding="0" style="display:inline-block;margin:0 0 8px 0;">
                        <tr>
                          <td style="padding:12px 24px;background-color:#EF4444;border-radius:6px;text-align:center;">
                            <a href="${cancelUrl}" style="color:#ffffff;text-decoration:none;font-weight:bold;display:inline-block;">Cancelar Cita</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:8px;font-size:12px;color:#6b7280;">Si no solicitaste esta cita, por favor contacta con el negocio.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    try {
      if (!toEmail) {
        if (!skipLogging) {
          await this.emailRepository.logEmail({
            negocioId: negocio.id,
            citaId: cita.id,
            destinatario: '(sin email)',
            asunto: subject,
            tipo: 'recordatorio_24h',
            estado: 'fallido',
            errorMensaje: 'Client email missing',
          });
        }
        return { sent: false, reason: 'missing_email' };
      }

      if (!transport) {
        if (!skipLogging) {
          await this.emailRepository.logEmail({
            negocioId: negocio.id,
            citaId: cita.id,
            destinatario: toEmail,
            asunto: subject,
            tipo: 'recordatorio_24h',
            estado: 'pendiente',
            errorMensaje: 'SMTP not configured',
          });
        }
        return { sent: false, reason: 'smtp_not_configured', cancelUrl };
      }

      const result = await transport.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: toEmail,
        subject,
        text,
        html,
      });

      console.log('✅ Reminder email sent successfully:', result);

      if (!skipLogging) {
        await this.emailRepository.logEmail({
          negocioId: negocio.id,
          citaId: cita.id,
          destinatario: toEmail,
          asunto: subject,
          tipo: 'recordatorio_24h',
          estado: 'enviado',
        });
      }

      return { sent: true };
    } catch (err) {
      console.error('❌ Reminder email sending failed:', err);
      if (!skipLogging) {
        await this.emailRepository.logEmail({
          negocioId: negocio.id,
          citaId: cita.id,
          destinatario: toEmail || '(sin email)',
          asunto: subject,
          tipo: 'recordatorio_24h',
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
