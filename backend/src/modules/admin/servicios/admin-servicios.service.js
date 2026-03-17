const { Inject, Injectable, NotFoundException } = require('@nestjs/common');
const { AdminServiciosRepository } = require('./admin-servicios.repository');

class AdminServiciosService {
  constructor(repo) {
    this.repo = repo;
  }

  async list(adminId, negocioId) {
    return await this.repo.listServiciosByAdmin({ adminId, negocioId });
  }

  async create(adminId, data) {
    const created = await this.repo.createServicio({ adminId, ...data });
    if (!created) throw new NotFoundException('Negocio not found');
    return created;
  }

  async update(adminId, servicioId, patch) {
    const updated = await this.repo.updateServicio({ adminId, servicioId, patch });
    if (!updated) throw new NotFoundException('Servicio not found');
    return updated;
  }

  async remove(adminId, servicioId) {
    const deleted = await this.repo.softDeleteServicio({ adminId, servicioId });
    if (!deleted) throw new NotFoundException('Servicio not found');
    return { ok: true };
  }
}

Injectable()(AdminServiciosService);
Inject(AdminServiciosRepository)(AdminServiciosService, undefined, 0);

module.exports = { AdminServiciosService };
