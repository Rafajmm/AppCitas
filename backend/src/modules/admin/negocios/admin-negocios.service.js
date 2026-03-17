const { Inject, Injectable, NotFoundException, BadRequestException } = require('@nestjs/common');
const { AdminNegociosRepository } = require('./admin-negocios.repository');

class AdminNegociosService {
  constructor(repo) {
    this.repo = repo;
  }

  async listMyNegocios(adminId) {
    return await this.repo.listNegociosByAdmin(adminId);
  }

  async updateMyNegocio(adminId, negocioId, patch) {
    const updated = await this.repo.updateNegocioBranding({ adminId, negocioId, patch });
    if (!updated) throw new NotFoundException('Negocio not found');
    return updated;
  }
}

Injectable()(AdminNegociosService);
Inject(AdminNegociosRepository)(AdminNegociosService, undefined, 0);

module.exports = { AdminNegociosService };
