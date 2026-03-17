const { Inject, Injectable } = require('@nestjs/common');
const { DB_POOL } = require('../../../modules/db/db.providers');

class AdminCitasRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async listCitas({ adminId, negocioId, empleadoId, fechaDesde, fechaHasta, estado }) {
    let whereClause = `WHERE n.id_admin = $1`;
    const params = [adminId];
    let paramIndex = 2;

    if (negocioId) {
      whereClause += ` AND c.negocio_id = $${paramIndex}`;
      params.push(negocioId);
      paramIndex++;
    }

    if (empleadoId) {
      whereClause += ` AND c.empleado_id = $${paramIndex}`;
      params.push(empleadoId);
      paramIndex++;
    }

    if (fechaDesde) {
      whereClause += ` AND c.fecha >= $${paramIndex}`;
      params.push(fechaDesde);
      paramIndex++;
    }

    if (fechaHasta) {
      whereClause += ` AND c.fecha <= $${paramIndex}`;
      params.push(fechaHasta);
      paramIndex++;
    }

    if (estado) {
      whereClause += ` AND c.estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    const { rows } = await this.pool.query(
      `SELECT c.id, c.negocio_id, c.empleado_id, c.nombre_cliente, c.email_cliente, c.telefono_cliente,
              c.fecha, c.hora_inicio, c.hora_fin, c.estado, c.confirmado, c.notas_cliente,
              c.precio_total, c.origen, c.token_confirmacion, c.created_at,
              e.nombre AS empleado_nombre,
              COALESCE(
                json_agg(
                  json_build_object(
                    'servicio_id', cs.servicio_id,
                    'nombre_servicio', cs.nombre_servicio,
                    'precio_servicio', cs.precio_servicio,
                    'duracion_minutos', cs.duracion_minutos
                  )
                ) FILTER (WHERE cs.servicio_id IS NOT NULL), 
                '[]'
              ) AS servicios
       FROM citas c
       JOIN negocios n ON n.id = c.negocio_id
       LEFT JOIN empleados e ON e.id = c.empleado_id
       LEFT JOIN cita_servicio cs ON cs.cita_id = c.id
       ${whereClause}
       GROUP BY c.id, e.nombre
       ORDER BY c.fecha DESC, c.hora_inicio DESC`,
      params,
    );
    return rows;
  }

  async updateCitaStatus({ adminId, citaId, estado }) {
    const { rows } = await this.pool.query(
      `UPDATE citas c
       SET estado = $1,
           updated_at = CURRENT_TIMESTAMP
       FROM negocios n
       WHERE n.id = c.negocio_id
         AND n.id_admin = $2
         AND c.id = $3
         AND c.deleted_at IS NULL
       RETURNING c.id, c.estado, c.confirmado, c.updated_at`,
      [estado, adminId, citaId],
    );

    return rows[0] || null;
  }
}

Injectable()(AdminCitasRepository);
Inject(DB_POOL)(AdminCitasRepository, undefined, 0);

module.exports = { AdminCitasRepository };
