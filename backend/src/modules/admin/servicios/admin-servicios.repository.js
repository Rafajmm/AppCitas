const { Inject, Injectable } = require('@nestjs/common');
const { DB_POOL } = require('../../../modules/db/db.providers');

class AdminServiciosRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async listServiciosByAdmin({ adminId, negocioId }) {
    if (negocioId) {
      const { rows } = await this.pool.query(
        `SELECT s.id, s.negocio_id, s.nombre, s.descripcion, s.duracion_minutos, s.precio, s.activo,
                s.created_at, s.updated_at
         FROM servicios s
         JOIN negocios n ON n.id = s.negocio_id
         WHERE s.deleted_at IS NULL
           AND n.deleted_at IS NULL
           AND n.id_admin = $1
           AND s.negocio_id = $2
         ORDER BY s.nombre ASC`,
        [adminId, negocioId],
      );
      return rows;
    }

    const { rows } = await this.pool.query(
      `SELECT s.id, s.negocio_id, s.nombre, s.descripcion, s.duracion_minutos, s.precio, s.activo,
              s.created_at, s.updated_at
       FROM servicios s
       JOIN negocios n ON n.id = s.negocio_id
       WHERE s.deleted_at IS NULL
         AND n.deleted_at IS NULL
         AND n.id_admin = $1
       ORDER BY s.nombre ASC`,
      [adminId],
    );
    return rows;
  }

  async createServicio({ adminId, negocioId, nombre, descripcion, duracion_minutos, precio, activo }) {
    const { rows } = await this.pool.query(
      `WITH n AS (
         SELECT id
         FROM negocios
         WHERE id = $1
           AND id_admin = $2
           AND deleted_at IS NULL
         LIMIT 1
       )
       INSERT INTO servicios (negocio_id, nombre, descripcion, duracion_minutos, precio, activo)
       SELECT n.id, $3, $4, $5, $6, $7
       FROM n
       RETURNING id, negocio_id, nombre, descripcion, duracion_minutos, precio, activo, created_at, updated_at`,
      [negocioId, adminId, nombre, descripcion || null, duracion_minutos, precio, activo],
    );

    return rows[0] || null;
  }

  async updateServicio({ adminId, servicioId, patch }) {
    const fields = [];
    const values = [adminId, servicioId];
    let idx = 3;

    for (const [k, v] of Object.entries(patch)) {
      fields.push(`${k} = $${idx}`);
      values.push(v);
      idx += 1;
    }
    if (!fields.length) return null;

    const { rows } = await this.pool.query(
      `UPDATE servicios s
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       FROM negocios n
       WHERE n.id = s.negocio_id
         AND n.deleted_at IS NULL
         AND n.id_admin = $1
         AND s.id = $2
         AND s.deleted_at IS NULL
       RETURNING s.id, s.negocio_id, s.nombre, s.descripcion, s.duracion_minutos, s.precio, s.activo, s.created_at, s.updated_at`,
      values,
    );

    return rows[0] || null;
  }

  async softDeleteServicio({ adminId, servicioId }) {
    const { rows } = await this.pool.query(
      `UPDATE servicios s
       SET deleted_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP,
           activo = false
       FROM negocios n
       WHERE n.id = s.negocio_id
         AND n.deleted_at IS NULL
         AND n.id_admin = $1
         AND s.id = $2
         AND s.deleted_at IS NULL
       RETURNING s.id`,
      [adminId, servicioId],
    );

    return rows[0] || null;
  }
}

Injectable()(AdminServiciosRepository);
Inject(DB_POOL)(AdminServiciosRepository, undefined, 0);

module.exports = { AdminServiciosRepository };
