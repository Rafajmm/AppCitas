const { Inject, Injectable } = require('@nestjs/common');
const { DB_POOL } = require('../../../modules/db/db.providers');

class AdminHorariosRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async getHorariosNegocio(adminId, negocioId) {
    const { rows } = await this.pool.query(
      `SELECT dia_semana, hora_apertura, hora_cierre, activo
       FROM horarios_negocio
       WHERE negocio_id = $1
         AND EXISTS (
           SELECT 1 FROM negocios n 
           WHERE n.id = $1 
             AND n.id_admin = $2 
             AND n.deleted_at IS NULL
         )
       ORDER BY dia_semana ASC`,
      [negocioId, adminId],
    );
    return rows;
  }

  async updateHorariosNegocio(adminId, negocioId, horarios) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Verify negocio belongs to admin
      const { rows: neg } = await client.query(
        `SELECT id FROM negocios WHERE id = $1 AND id_admin = $2 AND deleted_at IS NULL LIMIT 1`,
        [negocioId, adminId],
      );
      if (!neg[0]) throw new Error('Negocio not found');

      // Delete existing schedules
      await client.query(
        `DELETE FROM horarios_negocio WHERE negocio_id = $1`,
        [negocioId],
      );

      // Insert new schedules
      for (const h of horarios) {
        await client.query(
          `INSERT INTO horarios_negocio (negocio_id, dia_semana, hora_apertura, hora_cierre, activo)
           VALUES ($1, $2, $3, $4, $5)`,
          [negocioId, h.dia_semana, h.hora_apertura, h.hora_cierre, h.activo],
        );
      }

      await client.query('COMMIT');

      // Return updated schedules
      const { rows } = await this.pool.query(
        `SELECT dia_semana, hora_apertura, hora_cierre, activo
         FROM horarios_negocio
         WHERE negocio_id = $1
         ORDER BY dia_semana ASC`,
        [negocioId],
      );
      return rows;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async getHorariosEmpleado(adminId, empleadoId) {
    const { rows } = await this.pool.query(
      `SELECT he.dia_semana, he.hora_apertura, he.hora_cierre, he.activo
       FROM horarios_empleado he
       JOIN empleados e ON e.id = he.empleado_id
       JOIN negocios n ON n.id = e.negocio_id
       WHERE he.empleado_id = $1
         AND n.id_admin = $2
         AND e.deleted_at IS NULL
         AND n.deleted_at IS NULL
       ORDER BY he.dia_semana ASC`,
      [empleadoId, adminId],
    );
    return rows;
  }

  async updateHorariosEmpleado(adminId, empleadoId, horarios) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Verify empleado belongs to admin's negocio
      const { rows: emp } = await client.query(
        `SELECT e.id 
         FROM empleados e
         JOIN negocios n ON n.id = e.negocio_id
         WHERE e.id = $1 
           AND n.id_admin = $2 
           AND e.deleted_at IS NULL 
           AND n.deleted_at IS NULL
         LIMIT 1`,
        [empleadoId, adminId],
      );
      if (!emp[0]) throw new Error('Empleado not found');

      // Delete existing schedules
      await client.query(
        `DELETE FROM horarios_empleado WHERE empleado_id = $1`,
        [empleadoId],
      );

      // Insert new schedules
      for (const h of horarios) {
        await client.query(
          `INSERT INTO horarios_empleado (empleado_id, dia_semana, hora_apertura, hora_cierre, activo)
           VALUES ($1, $2, $3, $4, $5)`,
          [empleadoId, h.dia_semana, h.hora_apertura, h.hora_cierre, h.activo],
        );
      }

      await client.query('COMMIT');

      // Return updated schedules
      const { rows } = await this.pool.query(
        `SELECT dia_semana, hora_apertura, hora_cierre, activo
         FROM horarios_empleado
         WHERE empleado_id = $1
         ORDER BY dia_semana ASC`,
        [empleadoId],
      );
      return rows;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

Injectable()(AdminHorariosRepository);
Inject(DB_POOL)(AdminHorariosRepository, undefined, 0);

module.exports = { AdminHorariosRepository };
