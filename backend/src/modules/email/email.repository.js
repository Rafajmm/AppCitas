const { Inject, Injectable } = require('@nestjs/common');
const { DB_POOL } = require('../db/db.providers');

class EmailRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async logEmail({ negocioId, citaId, destinatario, asunto, tipo, estado, errorMensaje }) {
    try {
      await this.pool.query(
        `INSERT INTO email_logs (
           negocio_id, cita_id, destinatario, asunto, tipo, estado, error_mensaje, enviado_en
         ) VALUES ($1, $2, $3, $4, $5, $6::text, $7, CASE WHEN $6::text = 'enviado' THEN CURRENT_TIMESTAMP ELSE NULL END)`,
        [negocioId, citaId || null, destinatario, asunto, tipo, estado, errorMensaje || null],
      );
    } catch (error) {
      console.error('Error logging email:', error);
      // Don't throw error for logging failures
    }
  }
}

Injectable()(EmailRepository);
Inject(DB_POOL)(EmailRepository, undefined, 0);

module.exports = { EmailRepository };
