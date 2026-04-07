const { Inject, Injectable } = require('@nestjs/common');
const { DB_POOL } = require('../db/db.providers');

class RemindersRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async listBookingsFor24hReminder({ windowMinutes }) {
    const { rows } = await this.pool.query(
      `SELECT c.id,
              c.negocio_id,
              c.fecha,
              c.hora_inicio,
              c.hora_fin,
              c.nombre_cliente,
              c.email_cliente,
              c.token_cancelacion,
              n.nombre AS negocio_nombre,
              n.slug AS negocio_slug
       FROM citas c
       JOIN negocios n ON n.id = c.negocio_id
       WHERE c.deleted_at IS NULL
         AND n.deleted_at IS NULL
         AND c.estado = 'confirmada'
         AND c.recordatorio_enviado = false
         AND c.email_cliente IS NOT NULL
         AND (
           -- Convertir la fecha y hora de la cita a timestamp local y comparar con timestamp local
           (c.fecha::timestamp + c.hora_inicio)
           BETWEEN (NOW() + INTERVAL '24 hours' - ($1::int || ' minutes')::interval)
               AND (NOW() + INTERVAL '24 hours' + ($1::int || ' minutes')::interval)
         )
       ORDER BY c.fecha ASC, c.hora_inicio ASC
       LIMIT 200`,
      [windowMinutes],
    );

    return rows;
  }

  async markReminderProcessed(citaId) {
    await this.pool.query(
      `UPDATE citas
       SET recordatorio_enviado = true,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
         AND deleted_at IS NULL`,
      [citaId],
    );
  }
}

Injectable()(RemindersRepository);
Inject(DB_POOL)(RemindersRepository, undefined, 0);

module.exports = { RemindersRepository };
