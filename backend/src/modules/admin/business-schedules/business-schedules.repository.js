const { Inject } = require('@nestjs/common');

class BusinessSchedulesRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async getNegocioById(negocioId) {
    const { rows } = await this.pool.query(
      'SELECT * FROM negocios WHERE id = $1 AND deleted_at IS NULL',
      [negocioId]
    );
    return rows[0] || null;
  }

  async getBusinessSchedules(negocioId) {
    const { rows } = await this.pool.query(
      `SELECT * FROM horarios_negocio 
       WHERE negocio_id = $1 
       ORDER BY dia_semana`,
      [negocioId]
    );
    return rows;
  }

  async updateBusinessSchedules(negocioId, schedules) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Delete existing schedules
      await client.query(
        'DELETE FROM horarios_negocio WHERE negocio_id = $1',
        [negocioId]
      );

      // Insert new schedules
      for (const schedule of schedules) {
        await client.query(
          `INSERT INTO horarios_negocio 
           (negocio_id, dia_semana, hora_apertura, hora_cierre, activo, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [
            negocioId,
            schedule.dia_semana,
            schedule.hora_apertura,
            schedule.hora_cierre,
            schedule.activo !== false
          ]
        );
      }

      await client.query('COMMIT');

      // Return updated schedules
      return await this.getBusinessSchedules(negocioId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = { BusinessSchedulesRepository };
