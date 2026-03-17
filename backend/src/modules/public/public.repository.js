const { Inject, Injectable, BadRequestException } = require('@nestjs/common');
const { DB_POOL } = require('../db/db.providers');
const { timeToMinutes, minutesToTime } = require('../availability/availability.utils');

class PublicRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async listNegocios() {
    const { rows } = await this.pool.query(
      `SELECT id, nombre, slug, descripcion, direccion, telefono, email, logo_url,
              color_primario, color_secundario, color_acento, whatsapp, web_url,
              reservas_habilitadas, antelacion_minima_horas, activo
       FROM negocios
       WHERE deleted_at IS NULL AND activo = true
       ORDER BY nombre ASC`,
    );
    return rows;
  }

  async getNegocioBySlug(slug) {
    const { rows } = await this.pool.query(
      `SELECT id, nombre, slug, descripcion, direccion, telefono, email, logo_url,
              color_primario, color_secundario, color_acento, whatsapp, web_url,
              reservas_habilitadas, antelacion_minima_horas, tiempo_confirmacion_minutos, activo
       FROM negocios
       WHERE deleted_at IS NULL AND slug = $1
       LIMIT 1`,
      [slug],
    );
    return rows[0] || null;
  }

  async listServicios(negocioId) {
    const { rows } = await this.pool.query(
      `SELECT id, nombre, descripcion, duracion_minutos,
              COALESCE(precio_especial, precio) AS precio, activo
       FROM servicios
       WHERE negocio_id = $1 AND deleted_at IS NULL AND activo = true
       ORDER BY nombre ASC`,
      [negocioId],
    );
    return rows;
  }

  async getServicesForBooking(negocioId, serviceIds, employeeId) {
    if (employeeId) {
      const { rows } = await this.pool.query(
        `SELECT s.id, s.nombre, s.duracion_minutos,
                COALESCE(s.precio_especial, s.precio) AS precio_final
         FROM servicios s
         JOIN empleado_servicio es ON es.servicio_id = s.id AND es.empleado_id = $3 AND es.activo = true
         WHERE s.negocio_id = $1
           AND s.deleted_at IS NULL
           AND s.activo = true
           AND s.id = ANY($2::uuid[])`,
        [negocioId, serviceIds, employeeId],
      );
      return rows;
    }

    const { rows } = await this.pool.query(
      `SELECT s.id, s.nombre, s.duracion_minutos,
              COALESCE(s.precio_especial, s.precio) AS precio_final
       FROM servicios s
       WHERE s.negocio_id = $1
         AND s.deleted_at IS NULL
         AND s.activo = true
         AND s.id = ANY($2::uuid[])`,
      [negocioId, serviceIds],
    );
    return rows;
  }

  async assertWithinSchedules({ negocioId, employeeId, dayOfWeek, startMinutes, endMinutes }) {
    const { rows: nr } = await this.pool.query(
      `SELECT hora_apertura, hora_cierre
       FROM horarios_negocio
       WHERE negocio_id = $1 AND dia_semana = $2 AND activo = true
       LIMIT 1`,
      [negocioId, dayOfWeek],
    );
    if (!nr[0]) throw new BadRequestException('Business closed');

    const nOpen = timeToMinutes(nr[0].hora_apertura);
    const nClose = timeToMinutes(nr[0].hora_cierre);
    if (startMinutes < nOpen || endMinutes > nClose) throw new BadRequestException('Outside business hours');

    if (employeeId) {
      const { rows: er } = await this.pool.query(
        `SELECT hora_apertura, hora_cierre
         FROM horarios_empleado
         WHERE empleado_id = $1 AND dia_semana = $2 AND activo = true
         LIMIT 1`,
        [employeeId, dayOfWeek],
      );
      if (!er[0]) throw new BadRequestException('Employee not available');
      const eOpen = timeToMinutes(er[0].hora_apertura);
      const eClose = timeToMinutes(er[0].hora_cierre);
      if (startMinutes < eOpen || endMinutes > eClose) throw new BadRequestException('Outside employee hours');
    }
  }

  async createBookingTx({ negocioId, employeeId, date, startMinutes, endMinutes, client, notes, services, totalPrice }) {
    const clientConn = await this.pool.connect();
    try {
      await clientConn.query('BEGIN');

      // Serialize bookings by negocio+empleado+date to avoid race conditions
      const lockKey = `${negocioId}:${employeeId || 'any'}:${date}`;
      await clientConn.query('SELECT pg_advisory_xact_lock(hashtext($1))', [lockKey]);

      // Re-validate conflicts against citas and bloqueos
      const start = minutesToTime(startMinutes);
      const end = minutesToTime(endMinutes);

      const conflictParams = employeeId ? [negocioId, employeeId, date, start, end] : [negocioId, date, start, end];
      const citasConflictSql = employeeId
        ? `SELECT 1
           FROM citas
           WHERE deleted_at IS NULL
             AND negocio_id = $1
             AND empleado_id = $2
             AND fecha = $3::date
             AND estado IN ('pendiente','confirmada','completada','no_show')
             AND NOT (hora_fin <= $4::time OR hora_inicio >= $5::time)
           LIMIT 1`
        : `SELECT 1
           FROM citas
           WHERE deleted_at IS NULL
             AND negocio_id = $1
             AND fecha = $2::date
             AND estado IN ('pendiente','confirmada','completada','no_show')
             AND NOT (hora_fin <= $3::time OR hora_inicio >= $4::time)
           LIMIT 1`;

      const citasRes = await clientConn.query(citasConflictSql, conflictParams);
      if (citasRes.rowCount > 0) throw new BadRequestException('Time slot no longer available');

      // Bloqueos
      const bloqueosParams = employeeId ? [negocioId, employeeId, date, start, end] : [negocioId, date, start, end];
      const bloqueosSql = employeeId
        ? `SELECT 1
           FROM bloqueos_agenda
           WHERE activo = true
             AND negocio_id = $1
             AND ($2::uuid IS NULL OR empleado_id = $2 OR empleado_id IS NULL)
             AND $3::date BETWEEN fecha_inicio AND fecha_fin
             AND (
               (hora_inicio IS NULL AND hora_fin IS NULL)
               OR NOT (hora_fin <= $4::time OR hora_inicio >= $5::time)
             )
           LIMIT 1`
        : `SELECT 1
           FROM bloqueos_agenda
           WHERE activo = true
             AND negocio_id = $1
             AND empleado_id IS NULL
             AND $2::date BETWEEN fecha_inicio AND fecha_fin
             AND (
               (hora_inicio IS NULL AND hora_fin IS NULL)
               OR NOT (hora_fin <= $3::time OR hora_inicio >= $4::time)
             )
           LIMIT 1`;

      const bloqueosRes = await clientConn.query(bloqueosSql, bloqueosParams);
      if (bloqueosRes.rowCount > 0) throw new BadRequestException('Time slot blocked');

      const insertCita = await clientConn.query(
        `INSERT INTO citas (
           negocio_id, empleado_id, nombre_cliente, email_cliente, telefono_cliente,
           fecha, hora_inicio, hora_fin,
           estado, confirmado, notas_cliente, precio_total, origen
         ) VALUES (
           $1, $2, $3, $4, $5,
           $6::date, $7::time, $8::time,
           'pendiente', false, $9, $10, 'web'
         )
         RETURNING id, negocio_id, empleado_id, fecha, hora_inicio, hora_fin, estado, confirmado, token_confirmacion, precio_total`,
        [
          negocioId,
          employeeId,
          client.name,
          client.email || null,
          client.phone || null,
          date,
          start,
          end,
          notes || null,
          totalPrice,
        ],
      );

      const cita = insertCita.rows[0];

      for (const s of services) {
        await clientConn.query(
          `INSERT INTO cita_servicio (
             cita_id, servicio_id, empleado_id, nombre_servicio,
             precio_servicio, duracion_minutos
           ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [cita.id, s.id, employeeId, s.nombre, s.precio_final, s.duracion_minutos],
        );
      }

      await clientConn.query('COMMIT');
      return {
        ...cita,
        hora_inicio: String(cita.hora_inicio).slice(0, 5),
        hora_fin: String(cita.hora_fin).slice(0, 5),
      };
    } catch (e) {
      await clientConn.query('ROLLBACK');
      throw e;
    } finally {
      clientConn.release();
    }
  }

  async getAvailability(negocioId, date, serviceIds, employeeId) {
    console.log('=== DEBUG AVAILABILITY ===');
    console.log('negocioId:', negocioId);
    console.log('date:', date);
    console.log('serviceIds:', serviceIds);
    console.log('employeeId:', employeeId);
    
    // Get business info for advance notice validation
    const { rows: businessInfo } = await this.pool.query(
      `SELECT antelacion_minima_horas FROM negocios WHERE id = $1 AND deleted_at IS NULL`,
      [negocioId]
    );
    
    console.log('businessInfo:', businessInfo);
    
    if (businessInfo.length === 0) {
      console.log('Business not found, returning empty slots');
      return { slots: [] };
    }
    
    const minAdvanceHours = Number(businessInfo[0].antelacion_minima_horas) || 0;
    
    // Get day of week (0=Sunday, 1=Monday, etc.)
    const dayOfWeek = new Date(date).getDay();
    
    // Get business schedules for this day
    const { rows: businessSchedules } = await this.pool.query(
      `SELECT hora_apertura, hora_cierre
       FROM horarios_negocio
       WHERE negocio_id = $1 AND dia_semana = $2 AND activo = true
       LIMIT 1`,
      [negocioId, dayOfWeek]
    );
    
    console.log('dayOfWeek:', dayOfWeek);
    console.log('businessSchedules:', businessSchedules);
    
    if (businessSchedules.length === 0) {
      console.log('No business schedules found for this day, returning empty slots');
      return { slots: [] };
    }
    
    const businessSchedule = businessSchedules[0];
    const openMinutes = timeToMinutes(businessSchedule.hora_apertura);
    const closeMinutes = timeToMinutes(businessSchedule.hora_cierre);
    
    // Get employee schedules if employeeId is specified
    let employeeSchedule = null;
    if (employeeId) {
      const { rows: empSchedules } = await this.pool.query(
        `SELECT hora_apertura, hora_cierre
         FROM horarios_empleado
         WHERE empleado_id = $1 AND dia_semana = $2 AND activo = true
         LIMIT 1`,
        [employeeId, dayOfWeek]
      );
      
      if (empSchedules.length > 0) {
        employeeSchedule = empSchedules[0];
      }
    }
    
    // Determine effective working hours
    const effectiveOpen = employeeSchedule ? 
      Math.max(openMinutes, timeToMinutes(employeeSchedule.hora_apertura)) : 
      openMinutes;
    const effectiveClose = employeeSchedule ? 
      Math.min(closeMinutes, timeToMinutes(employeeSchedule.hora_cierre)) : 
      closeMinutes;
    
    if (effectiveOpen >= effectiveClose) {
      return { slots: [] };
    }
    
    // Get total duration for selected services
    const { rows: services } = await this.pool.query(
      `SELECT duracion_minutos
       FROM servicios
       WHERE id = ANY($1::uuid[]) AND negocio_id = $2 AND deleted_at IS NULL AND activo = true`,
      [serviceIds, negocioId]
    );
    
    console.log('services query result:', services);
    console.log('expected serviceIds length:', serviceIds.length);
    
    if (services.length !== serviceIds.length) {
      console.log('Services validation failed, returning empty slots');
      return { slots: [] };
    }
    
    const totalDuration = services.reduce((sum, s) => sum + Number(s.duracion_minutos), 0);
    
    // Calculate minimum start time based on advance notice
    const now = new Date();
    const isToday = date === now.toISOString().split('T')[0];
    let minStartMinutes = effectiveOpen;
    
    if (isToday && minAdvanceHours > 0) {
      const minStartDateTime = new Date(now.getTime() + minAdvanceHours * 60 * 60 * 1000);
      minStartMinutes = Math.max(effectiveOpen, 
        minStartDateTime.getUTCHours() * 60 + minStartDateTime.getUTCMinutes()
      );
    }
    
    // Generate time slots
    const slots = [];
    for (let startMinutes = effectiveOpen; startMinutes + totalDuration <= effectiveClose; startMinutes += 30) {
      const endMinutes = startMinutes + totalDuration;
      
      // Skip slots before minimum advance time
      if (isToday && startMinutes < minStartMinutes) {
        continue;
      }
      
      // Check for conflicts with existing appointments
      const conflictSql = employeeId ?
        `SELECT 1
         FROM citas
         WHERE deleted_at IS NULL
           AND negocio_id = $1
           AND empleado_id = $2
           AND fecha = $3::date
           AND estado IN ('pendiente','confirmada','completada','no_show')
           AND (
             (hora_inicio < $5::time AND hora_fin > $4::time) OR
             (hora_inicio >= $4::time AND hora_inicio < $5::time) OR
             (hora_inicio <= $4::time AND hora_fin >= $5::time)
           )
         LIMIT 1` :
        `SELECT 1
         FROM citas
         WHERE deleted_at IS NULL
           AND negocio_id = $1
           AND fecha = $2::date
           AND estado IN ('pendiente','confirmada','completada','no_show')
           AND (
             (hora_inicio < $4::time AND hora_fin > $3::time) OR
             (hora_inicio >= $3::time AND hora_inicio < $4::time) OR
             (hora_inicio <= $3::time AND hora_fin >= $4::time)
           )
         LIMIT 1`;
      
      const conflictParams = employeeId ? 
        [negocioId, employeeId, date, minutesToTime(startMinutes), minutesToTime(endMinutes)] :
        [negocioId, date, minutesToTime(startMinutes), minutesToTime(endMinutes)];
      
      const { rows: conflicts } = await this.pool.query(conflictSql, conflictParams);
      
      if (conflicts.length === 0) {
        slots.push({
          start: minutesToTime(startMinutes),
          end: minutesToTime(endMinutes),
          available: true
        });
      }
    }
    
    return { slots };
  }

  async findPendingBooking(email, date, startTime) {
    console.log('=== BACKEND DEBUG ===');
    console.log('Searching for booking with:', { email, date, startTime });
    
    const { rows } = await this.pool.query(
      `SELECT c.*, n.nombre as negocio_nombre, n.slug as negocio_slug
       FROM citas c
       LEFT JOIN negocios n ON c.negocio_id = n.id
       WHERE c.email_cliente = $1 
         AND c.fecha = $2::date
         AND c.hora_inicio::time = $3::time
         AND c.estado = 'pendiente'
         AND c.deleted_at IS NULL
       ORDER BY c.created_at DESC
       LIMIT 1`,
      [email, date, startTime]
    );
    
    console.log('Query result:', rows);
    console.log('==================');
    
    return rows[0] || null;
  }

  async getNegocioById(negocioId) {
    const { rows } = await this.pool.query(
      `SELECT id, nombre, slug FROM negocios WHERE id = $1 AND deleted_at IS NULL`,
      [negocioId]
    );
    
    return rows[0] || null;
  }

  async confirmBookingByToken(token) {
    // First try to update if pending
    const { rows } = await this.pool.query(
      `UPDATE citas
       SET confirmado = true,
           confirmado_en = CURRENT_TIMESTAMP,
           estado = 'confirmada',
           updated_at = CURRENT_TIMESTAMP
       WHERE token_confirmacion = $1
         AND deleted_at IS NULL
         AND estado = 'pendiente'
       RETURNING id, negocio_id, fecha, hora_inicio, hora_fin, estado, confirmado`,
      [token],
    );
    
    if (rows.length > 0) {
      return rows[0]; // Successfully confirmed
    }
    
    // If not updated, check if it's already confirmed
    const { rows: existingRows } = await this.pool.query(
      `SELECT id, negocio_id, fecha, hora_inicio, hora_fin, estado, confirmado
       FROM citas
       WHERE token_confirmacion = $1
         AND deleted_at IS NULL`,
      [token],
    );
    
    if (existingRows.length > 0) {
      const booking = existingRows[0];
      if (booking.estado === 'confirmada') {
        return { ...booking, alreadyConfirmed: true };
      }
    }
    
    return null; // Token not found
  }
}

Injectable()(PublicRepository);
Inject(DB_POOL)(PublicRepository, undefined, 0);

module.exports = { PublicRepository };
