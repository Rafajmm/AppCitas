const { BadRequestException, NotFoundException } = require('@nestjs/common');
const { Inject } = require('@nestjs/common');
const { EmployeeSchedulesRepository } = require('./employee-schedules.repository');

class EmployeeSchedulesService {
  constructor(employeeSchedulesRepository) {
    this.employeeSchedulesRepository = employeeSchedulesRepository;
  }

  async getEmployeeSchedules(adminId, employeeId) {
    // Verify admin owns the employee's business
    const employee = await this.employeeSchedulesRepository.getEmployeeById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const negocio = await this.employeeSchedulesRepository.getNegocioById(employee.negocio_id);
    if (!negocio || negocio.id_admin !== adminId) {
      throw new NotFoundException('Access denied');
    }

    return await this.employeeSchedulesRepository.getEmployeeSchedules(employeeId);
  }

  async updateEmployeeSchedules(adminId, employeeId, schedules) {
    // Verify admin owns the employee's business
    const employee = await this.employeeSchedulesRepository.getEmployeeById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const negocio = await this.employeeSchedulesRepository.getNegocioById(employee.negocio_id);
    if (!negocio || negocio.id_admin !== adminId) {
      throw new NotFoundException('Access denied');
    }

    // Validate schedules
    for (const schedule of schedules) {
      if (schedule.hora_apertura >= schedule.hora_cierre) {
        throw new BadRequestException('Opening time must be before closing time');
      }
    }

    return await this.employeeSchedulesRepository.updateEmployeeSchedules(employeeId, schedules);
  }
}

module.exports = { EmployeeSchedulesService };
