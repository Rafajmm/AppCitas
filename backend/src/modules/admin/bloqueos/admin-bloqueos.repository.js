const { Inject, Injectable } = require('@nestjs/common');
const { DB_POOL } = require('../../../modules/db/db.providers');

class AdminBloqueosRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async listBloqueos({ adminId, negocioId, empleadoId, fechaDesde, fechaHasta }) {
    let whereClause = `WHERE n.id_admin = $1`;
    const params = [adminId];
    let paramIndex = 2;

    if (negocioId) {
      whereClause += ` AND ba.negocio_id = $${paramIndex}`;
      params.push(negocioId);
      paramIndex++;
    }

    if (empleadoId) {
      whereClause += ` AND ba.empleado_id = $${paramIndex}`;
      params.push(empleadoId);
      paramIndex++;
    }

    if (fechaDesde) {
      whereClause += ` AND ba.fecha_fin >= $${paramIndex}`;
      params.push(fechaDesde);
      paramIndex++;
    }

    if (fechaHasta) {
      whereClause += ` AND ba.fecha_inicio <= $${paramIndex}`;
      params.push(fechaHasta);
      paramIndex++;
    }

    const { rows } = await this.pool.query(
      `SELECT ba.id, ba.negocio_id, ba.empleado_id, ba.fecha_inicio, ba.fecha_fin,
              ba.hora_inicio, ba.hora_fin, ba.titulo, ba.descripcion, ba.activo, ba.created_at,
              e.nombre AS empleado_nombre
       FROM bloqueos_agenda ba
       JOIN negocios n ON n.id = ba.negocio_id
       LEFT JOIN empleados e ON e.id = ba.empleado_id
       ${whereClause}
       ORDER BY ba.fecha_inicio ASC, ba.hora_inicio ASC NULLS FIRST`,
      params,
    );
    return rows;
  }

  async createBloqueo({ adminId, negocioId, empleadoId, fecha_inicio, fecha_fin, hora_inicio, hora_fin, titulo, descripcion, activo }) {
    const { rows } = await this.pool.query(
      `WITH valid_negocio AS (
         SELECT id FROM negocios WHERE id = $1 AND id_admin = $2 AND deleted_at IS NULL LIMIT 1
       )
       INSERT INTO bloqueos_agenda (negocio_id, empleado_id, fecha_inicio, fecha_fin, hora_inicio, hora_fin, titulo, descripcion, activo)
       SELECT $1, $3, $4, $5, $6, $7, $8, $9, $10
       FROM valid_negocio
       RETURNING id, negocio_id, empleado_id, fecha_inicio, fecha_fin, hora_inicio, hora_fin, titulo, descripcion, activo, created_at`,
      [negocioId, adminId, empleadoId || null, fecha_inicio, fecha_fin, hora_inicio || null, hora_fin || null, titulo, descripcion || null, activo],
    );

    return rows[0] || null;
  }

  async deleteBloqueo({ adminId, bloqueoId }) {
    const { rows } = await this.pool.query(
      `UPDATE bloqueos_agenda ba
       SET activo = false
       FROM negocios n
       WHERE n.id = ba.negocio_id
         AND n.id_admin = $1
         AND ba.id = $2
       RETURNING ba.id`,
      [adminId, bloqueoId],
    );

    return rows[0] || null;
  }
}

Injectable()(AdminBloqueosRepository);
Inject(DB_POOL)(AdminBloqueosRepository, undefined, 0);

module.exports = { AdminBloqueosRepository };
