const { Inject, Injectable } = require('@nestjs/common');
const { RemindersRepository } = require('./reminders.repository');
const { EmailService } = require('../email/email.service');

class RemindersService {
  constructor(repo, emailService) {
    this.repo = repo;
    this.emailService = emailService;

    const enabled = String(process.env.REMINDERS_ENABLED || 'true').toLowerCase() !== 'false';
    this.enabled = enabled;

    const windowMinutes = process.env.REMINDER_WINDOW_MINUTES ? Number(process.env.REMINDER_WINDOW_MINUTES) : 5;
    this.windowMinutes = Number.isFinite(windowMinutes) ? windowMinutes : 5;

    const intervalMs = process.env.REMINDER_INTERVAL_MS ? Number(process.env.REMINDER_INTERVAL_MS) : 60_000;
    this.intervalMs = Number.isFinite(intervalMs) ? intervalMs : 60_000;

    this.running = false;

    if (this.enabled) {
      this.timer = setInterval(() => {
        this.runOnce().catch((err) => console.error('RemindersService error:', err));
      }, this.intervalMs);

      this.timer.unref && this.timer.unref();
    }
  }

  async runOnce() {
    if (!this.enabled) return;
    if (this.running) return;

    this.running = true;
    try {
      const bookings = await this.repo.listBookingsFor24hReminder({ windowMinutes: this.windowMinutes });
      for (const b of bookings) {
        const emailResult = await this.emailService.sendBookingReminderEmail({
          negocio: { id: b.negocio_id, nombre: b.negocio_nombre, slug: b.negocio_slug },
          cita: b,
          toEmail: b.email_cliente,
        });

        if (emailResult && emailResult.sent) {
          await this.repo.markReminderProcessed(b.id);
        }
      }
    } finally {
      this.running = false;
    }
  }
}

Injectable()(RemindersService);
Inject(RemindersRepository)(RemindersService, undefined, 0);
Inject(EmailService)(RemindersService, undefined, 1);

module.exports = { RemindersService };
