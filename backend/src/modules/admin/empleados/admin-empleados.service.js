const { Inject, Injectable, NotFoundException } = require('@nestjs/common');
const { AdminEmpleadosRepository } = require('./admin-empleados.repository');

class AdminEmpleadosService {
  constructor(repo) {
    this.repo = repo;
  }

  async list(adminId, negocioId) {
    return await this.repo.listEmpleadosByAdmin({ adminId, negocioId });
  }

  async create(adminId, data) {
    const created = await this.repo.createEmpleado({ adminId, ...data });
    if (!created) throw new NotFoundException('Negocio not found');
    return created;
  }

  async update(adminId, empleadoId, patch) {
    const updated = await this.repo.updateEmpleado({ adminId, empleadoId, patch });
    if (!updated) throw new NotFoundException('Empleado not found');
    return updated;
  }

  async remove(adminId, empleadoId) {
    const deleted = await this.repo.softDeleteEmpleado({ adminId, empleadoId });
    if (!deleted) throw new NotFoundException('Empleado not found');
    return { ok: true };
  }
}

Injectable()(AdminEmpleadosService);
Inject(AdminEmpleadosRepository)(AdminEmpleadosService, undefined, 0);

module.exports = { AdminEmpleadosService };
