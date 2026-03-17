const { Inject, Injectable } = require('@nestjs/common');
const { DB_POOL } = require('../../../modules/db/db.providers');

class AdminEmpleadosRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async listEmpleadosByAdmin({ adminId, negocioId }) {
    if (negocioId) {
      const { rows } = await this.pool.query(
        `SELECT e.id, e.negocio_id, e.nombre, e.email, e.telefono, e.foto_url, e.activo,
                e.created_at, e.updated_at
         FROM empleados e
         JOIN negocios n ON n.id = e.negocio_id
         WHERE e.deleted_at IS NULL
           AND n.deleted_at IS NULL
           AND n.id_admin = $1
           AND e.negocio_id = $2
         ORDER BY e.nombre ASC`,
        [adminId, negocioId],
      );
      return rows;
    }

    const { rows } = await this.pool.query(
      `SELECT e.id, e.negocio_id, e.nombre, e.email, e.telefono, e.foto_url, e.activo,
              e.created_at, e.updated_at
       FROM empleados e
       JOIN negocios n ON n.id = e.negocio_id
       WHERE e.deleted_at IS NULL
         AND n.deleted_at IS NULL
         AND n.id_admin = $1
       ORDER BY e.nombre ASC`,
      [adminId],
    );
    return rows;
  }

  async createEmpleado({ adminId, negocioId, nombre, email, telefono, foto_url, activo }) {
    const { rows } = await this.pool.query(
      `WITH n AS (
         SELECT id
         FROM negocios
         WHERE id = $1
           AND id_admin = $2
           AND deleted_at IS NULL
         LIMIT 1
       )
       INSERT INTO empleados (negocio_id, nombre, email, telefono, foto_url, activo)
       SELECT n.id, $3, $4, $5, $6, $7
       FROM n
       RETURNING id, negocio_id, nombre, email, telefono, foto_url, activo, created_at, updated_at`,
      [negocioId, adminId, nombre, email || null, telefono || null, foto_url || null, activo],
    );

    return rows[0] || null;
  }

  async updateEmpleado({ adminId, empleadoId, patch }) {
    const fields = [];
    const values = [adminId, empleadoId];
    let idx = 3;

    for (const [k, v] of Object.entries(patch)) {
      fields.push(`${k} = $${idx}`);
      values.push(v);
      idx += 1;
    }
    if (!fields.length) return null;

    const { rows } = await this.pool.query(
      `UPDATE empleados e
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       FROM negocios n
       WHERE n.id = e.negocio_id
         AND n.deleted_at IS NULL
         AND n.id_admin = $1
         AND e.id = $2
         AND e.deleted_at IS NULL
       RETURNING e.id, e.negocio_id, e.nombre, e.email, e.telefono, e.foto_url, e.activo, e.created_at, e.updated_at`,
      values,
    );

    return rows[0] || null;
  }

  async softDeleteEmpleado({ adminId, empleadoId }) {
    const { rows } = await this.pool.query(
      `UPDATE empleados e
       SET deleted_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP,
           activo = false
       FROM negocios n
       WHERE n.id = e.negocio_id
         AND n.deleted_at IS NULL
         AND n.id_admin = $1
         AND e.id = $2
         AND e.deleted_at IS NULL
       RETURNING e.id`,
      [adminId, empleadoId],
    );

    return rows[0] || null;
  }
}

Injectable()(AdminEmpleadosRepository);
Inject(DB_POOL)(AdminEmpleadosRepository, undefined, 0);

module.exports = { AdminEmpleadosRepository };
