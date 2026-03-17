const { Inject, Injectable } = require('@nestjs/common');
const { DB_POOL } = require('../../../modules/db/db.providers');

class AdminEmpleadoServicioRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async getServiciosByEmpleado({ adminId, empleadoId }) {
    const { rows } = await this.pool.query(
      `SELECT es.id, es.empleado_id, es.servicio_id, es.activo,
              s.nombre AS servicio_nombre, s.duracion_minutos, s.precio,
              s.descripcion AS servicio_descripcion
       FROM empleado_servicio es
       JOIN servicios s ON s.id = es.servicio_id
       JOIN empleados e ON e.id = es.empleado_id
       JOIN negocios n ON n.id = e.negocio_id
       WHERE s.deleted_at IS NULL
         AND e.deleted_at IS NULL
         AND n.deleted_at IS NULL
         AND n.id_admin = $1
         AND es.empleado_id = $2
         AND es.activo = true
       ORDER BY s.nombre ASC`,
      [adminId, empleadoId],
    );
    return rows;
  }

  async assignServicioToEmpleado({ adminId, empleadoId, servicioId }) {
    const { rows } = await this.pool.query(
      `WITH valid AS (
         SELECT e.id AS empleado_id, s.id AS servicio_id
         FROM empleados e
         JOIN negocios n ON n.id = e.negocio_id
         JOIN servicios s ON s.negocio_id = n.id
         WHERE e.id = $1
           AND s.id = $2
           AND n.id_admin = $3
           AND e.deleted_at IS NULL
           AND s.deleted_at IS NULL
           AND n.deleted_at IS NULL
         LIMIT 1
       )
       INSERT INTO empleado_servicio (empleado_id, servicio_id, activo)
       SELECT empleado_id, servicio_id, true
       FROM valid
       ON CONFLICT (empleado_id, servicio_id) DO UPDATE SET
         activo = true
       RETURNING id, empleado_id, servicio_id, activo, created_at`,
      [empleadoId, servicioId, adminId],
    );

    return rows[0] || null;
  }

  async unassignServicioFromEmpleado({ adminId, empleadoId, servicioId }) {
    const { rows } = await this.pool.query(
      `UPDATE empleado_servicio es
       SET activo = false
       FROM empleados e
       JOIN negocios n ON n.id = e.negocio_id
       WHERE es.empleado_id = e.id
         AND es.servicio_id = $1
         AND e.id = $2
         AND n.id_admin = $3
         AND es.activo = true
         AND e.deleted_at IS NULL
         AND n.deleted_at IS NULL
       RETURNING es.id`,
      [servicioId, empleadoId, adminId],
    );

    return rows[0] || null;
  }
}

Injectable()(AdminEmpleadoServicioRepository);
Inject(DB_POOL)(AdminEmpleadoServicioRepository, undefined, 0);

module.exports = { AdminEmpleadoServicioRepository };
