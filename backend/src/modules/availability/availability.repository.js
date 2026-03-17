const { Inject, Injectable } = require('@nestjs/common');
const { DB_POOL } = require('../db/db.providers');
const { timeToMinutes } = require('./availability.utils');

class AvailabilityRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async getNegocioBySlug(slug) {
    const { rows } = await this.pool.query(
      `SELECT id, slug, activo, reservas_habilitadas, antelacion_minima_horas
       FROM negocios
       WHERE slug = $1 AND deleted_at IS NULL
       LIMIT 1`,
      [slug],
    );
    return rows[0] || null;
  }

  async getServicesByIds(negocioId, serviceIds) {
    const { rows } = await this.pool.query(
      `SELECT id, duracion_minutos
       FROM servicios
       WHERE negocio_id = $1
         AND deleted_at IS NULL
         AND activo = true
         AND id = ANY($2::uuid[])`,
      [negocioId, serviceIds],
    );
    return rows;
  }

  async getNegocioScheduleForDay(negocioId, dayOfWeek) {
    const { rows } = await this.pool.query(
      `SELECT hora_apertura, hora_cierre
       FROM horarios_negocio
       WHERE negocio_id = $1
         AND dia_semana = $2
         AND activo = true
       LIMIT 1`,
      [negocioId, dayOfWeek],
    );
    return rows[0] || null;
  }

  async getEmpleadoScheduleForDay(empleadoId, dayOfWeek) {
    const { rows } = await this.pool.query(
      `SELECT hora_apertura, hora_cierre
       FROM horarios_empleado
       WHERE empleado_id = $1
         AND dia_semana = $2
         AND activo = true
       LIMIT 1`,
      [empleadoId, dayOfWeek],
    );
    return rows[0] || null;
  }

  async getBusyIntervals({ negocioId, date, employeeId }) {
    const busy = [];

    // Bloqueos
    if (employeeId) {
      const { rows: br } = await this.pool.query(
        `SELECT hora_inicio, hora_fin
         FROM bloqueos_agenda
         WHERE activo = true
           AND (empleado_id = $1 OR empleado_id IS NULL)
           AND negocio_id = $2
           AND $3::date BETWEEN fecha_inicio AND fecha_fin`,
        [employeeId, negocioId, date],
      );
      for (const r of br) {
        if (!r.hora_inicio && !r.hora_fin) {
          busy.push([0, 24 * 60]);
        } else {
          busy.push([timeToMinutes(r.hora_inicio), timeToMinutes(r.hora_fin)]);
        }
      }
    } else {
      const { rows: br } = await this.pool.query(
        `SELECT hora_inicio, hora_fin
         FROM bloqueos_agenda
         WHERE activo = true
           AND empleado_id IS NULL
           AND negocio_id = $1
           AND $2::date BETWEEN fecha_inicio AND fecha_fin`,
        [negocioId, date],
      );
      for (const r of br) {
        if (!r.hora_inicio && !r.hora_fin) {
          busy.push([0, 24 * 60]);
        } else {
          busy.push([timeToMinutes(r.hora_inicio), timeToMinutes(r.hora_fin)]);
        }
      }
    }

    // Citas: por requerimiento, pendientes también bloquean.
    // Excluimos canceladas.
    if (employeeId) {
      const { rows: cr } = await this.pool.query(
        `SELECT hora_inicio, hora_fin
         FROM citas
         WHERE deleted_at IS NULL
           AND negocio_id = $1
           AND empleado_id = $2
           AND fecha = $3::date
           AND estado IN ('pendiente', 'confirmada', 'completada', 'no_show')`,
        [negocioId, employeeId, date],
      );
      for (const r of cr) {
        busy.push([timeToMinutes(r.hora_inicio), timeToMinutes(r.hora_fin)]);
      }
    } else {
      // Si no se especifica empleado, bloqueamos con cualquier cita del negocio.
      // Nota: esto es "conservador"; más adelante podemos devolver slots por empleado.
      const { rows: cr } = await this.pool.query(
        `SELECT hora_inicio, hora_fin
         FROM citas
         WHERE deleted_at IS NULL
           AND negocio_id = $1
           AND fecha = $2::date
           AND estado IN ('pendiente', 'confirmada', 'completada', 'no_show')`,
        [negocioId, date],
      );
      for (const r of cr) {
        busy.push([timeToMinutes(r.hora_inicio), timeToMinutes(r.hora_fin)]);
      }
    }

    // Normalización básica: ordenar y merge de intervalos
    busy.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const [s, e] of busy) {
      if (!merged.length) {
        merged.push([s, e]);
        continue;
      }
      const last = merged[merged.length - 1];
      if (s <= last[1]) {
        last[1] = Math.max(last[1], e);
      } else {
        merged.push([s, e]);
      }
    }

    return merged;
  }
}

Injectable()(AvailabilityRepository);
// Inject DB pool into first constructor param
Inject(DB_POOL)(AvailabilityRepository, undefined, 0);

module.exports = { AvailabilityRepository };
