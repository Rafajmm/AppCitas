const { Inject, Injectable, NotFoundException } = require('@nestjs/common');
const { AdminCitasRepository } = require('./admin-citas.repository');

class AdminCitasService {
  constructor(repo) {
    this.repo = repo;
  }

  async list(adminId, filters) {
    return await this.repo.listCitas({ adminId, ...filters });
  }

  async updateStatus(adminId, citaId, estado) {
    const updated = await this.repo.updateCitaStatus({ adminId, citaId, estado });
    if (!updated) throw new NotFoundException('Cita not found');
    return updated;
  }
}

Injectable()(AdminCitasService);
Inject(AdminCitasRepository)(AdminCitasService, undefined, 0);

module.exports = { AdminCitasService };
