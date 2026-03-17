const { Inject, Injectable, NotFoundException, BadRequestException } = require('@nestjs/common');
const { AdminEmpleadoServicioRepository } = require('./admin-empleado-servicio.repository');

class AdminEmpleadoServicioService {
  constructor(repo) {
    this.repo = repo;
  }

  async listServiciosByEmpleado(adminId, empleadoId) {
    return await this.repo.getServiciosByEmpleado({ adminId, empleadoId });
  }

  async assignServicio(adminId, { empleadoId, servicioId }) {
    const assigned = await this.repo.assignServicioToEmpleado({ adminId, empleadoId, servicioId });
    if (!assigned) throw new NotFoundException('Empleado or servicio not found or not accessible');
    return assigned;
  }

  async unassignServicio(adminId, empleadoId, servicioId) {
    const unassigned = await this.repo.unassignServicioFromEmpleado({ adminId, empleadoId, servicioId });
    if (!unassigned) throw new NotFoundException('Assignment not found or not accessible');
    return { ok: true };
  }
}

Injectable()(AdminEmpleadoServicioService);
Inject(AdminEmpleadoServicioRepository)(AdminEmpleadoServicioService, undefined, 0);

module.exports = { AdminEmpleadoServicioService };
