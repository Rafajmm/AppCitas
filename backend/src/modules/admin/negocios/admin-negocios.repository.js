const { Inject, Injectable } = require('@nestjs/common');
const { DB_POOL } = require('../../../modules/db/db.providers');

class AdminNegociosRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async listNegociosByAdmin(adminId) {
    const { rows } = await this.pool.query(
      `SELECT id, nombre, slug, descripcion, logo_url, color_primario, color_secundario, color_acento,
              whatsapp, web_url, reservas_habilitadas, antelacion_minima_horas, tiempo_confirmacion_minutos, activo
       FROM negocios
       WHERE deleted_at IS NULL AND id_admin = $1
       ORDER BY created_at DESC`,
      [adminId],
    );
    return rows;
  }

  async updateNegocioBranding({ adminId, negocioId, patch }) {
    const fields = [];
    const values = [adminId, negocioId];
    let idx = 3;

    for (const [k, v] of Object.entries(patch)) {
      fields.push(`${k} = $${idx}`);
      values.push(v);
      idx += 1;
    }
    if (!fields.length) return null;

    const { rows } = await this.pool.query(
      `UPDATE negocios
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id_admin = $1 AND id = $2 AND deleted_at IS NULL
       RETURNING id, nombre, slug, descripcion, logo_url, color_primario, color_secundario, color_acento,
                 whatsapp, web_url, reservas_habilitadas, antelacion_minima_horas, tiempo_confirmacion_minutos, activo`,
      values,
    );

    return rows[0] || null;
  }
}

Injectable()(AdminNegociosRepository);
Inject(DB_POOL)(AdminNegociosRepository, undefined, 0);

module.exports = { AdminNegociosRepository };
