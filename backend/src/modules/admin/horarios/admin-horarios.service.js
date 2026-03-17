const { Inject, Injectable, NotFoundException, BadRequestException } = require('@nestjs/common');
const { AdminHorariosRepository } = require('./admin-horarios.repository');

class AdminHorariosService {
  constructor(repo) {
    this.repo = repo;
  }

  async getHorariosNegocio(adminId, negocioId) {
    return await this.repo.getHorariosNegocio(adminId, negocioId);
  }

  async updateHorariosNegocio(adminId, negocioId, horarios) {
    // Validate time ranges
    for (const h of horarios) {
      const open = new Date(`2000-01-01T${h.hora_apertura}:00`);
      const close = new Date(`2000-01-01T${h.hora_cierre}:00`);
      if (open >= close) {
        throw new BadRequestException(`Hora apertura debe ser menor que hora cierre para día ${h.dia_semana}`);
      }
    }

    try {
      return await this.repo.updateHorariosNegocio(adminId, negocioId, horarios);
    } catch (e) {
      if (e.message === 'Negocio not found') {
        throw new NotFoundException('Negocio not found');
      }
      throw e;
    }
  }

  async getHorariosEmpleado(adminId, empleadoId) {
    return await this.repo.getHorariosEmpleado(adminId, empleadoId);
  }

  async updateHorariosEmpleado(adminId, empleadoId, horarios) {
    // Validate time ranges
    for (const h of horarios) {
      const open = new Date(`2000-01-01T${h.hora_apertura}:00`);
      const close = new Date(`2000-01-01T${h.hora_cierre}:00`);
      if (open >= close) {
        throw new BadRequestException(`Hora apertura debe ser menor que hora cierre para día ${h.dia_semana}`);
      }
    }

    try {
      return await this.repo.updateHorariosEmpleado(adminId, empleadoId, horarios);
    } catch (e) {
      if (e.message === 'Empleado not found') {
        throw new NotFoundException('Empleado not found');
      }
      throw e;
    }
  }
}

Injectable()(AdminHorariosService);
Inject(AdminHorariosRepository)(AdminHorariosService, undefined, 0);

module.exports = { AdminHorariosService };
