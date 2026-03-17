const { Inject } = require('@nestjs/common');

class EmployeeSchedulesRepository {
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

  async getEmployeeById(employeeId) {
    const { rows } = await this.pool.query(
      'SELECT * FROM empleados WHERE id = $1 AND deleted_at IS NULL',
      [employeeId]
    );
    return rows[0] || null;
  }

  async getEmployeeSchedules(employeeId) {
    const { rows } = await this.pool.query(
      `SELECT * FROM horarios_empleado 
       WHERE empleado_id = $1 
       ORDER BY dia_semana`,
      [employeeId]
    );
    return rows;
  }

  async updateEmployeeSchedules(employeeId, schedules) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Delete existing schedules
      await client.query(
        'DELETE FROM horarios_empleado WHERE empleado_id = $1',
        [employeeId]
      );

      // Insert new schedules
      for (const schedule of schedules) {
        await client.query(
          `INSERT INTO horarios_empleado 
           (empleado_id, dia_semana, hora_apertura, hora_cierre, activo, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [
            employeeId,
            schedule.dia_semana,
            schedule.hora_apertura,
            schedule.hora_cierre,
            schedule.activo !== false
          ]
        );
      }

      await client.query('COMMIT');

      // Return updated schedules
      return await this.getEmployeeSchedules(employeeId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = { EmployeeSchedulesRepository };
