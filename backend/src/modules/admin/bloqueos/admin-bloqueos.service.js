const { Inject, Injectable, NotFoundException, BadRequestException } = require('@nestjs/common');
const { AdminBloqueosRepository } = require('./admin-bloqueos.repository');

class AdminBloqueosService {
  constructor(repo) {
    this.repo = repo;
  }

  async list(adminId, filters) {
    return await this.repo.listBloqueos({ adminId, ...filters });
  }

  async create(adminId, data) {
    // Validate date range
    const start = new Date(`${data.fecha_inicio}T00:00:00`);
    const end = new Date(`${data.fecha_fin}T00:00:00`);
    if (start > end) {
      throw new BadRequestException('fecha_inicio debe ser menor o igual a fecha_fin');
    }

    // Validate time range if provided
    if (data.hora_inicio && data.hora_fin) {
      const startTime = new Date(`2000-01-01T${data.hora_inicio}:00`);
      const endTime = new Date(`2000-01-01T${data.hora_fin}:00`);
      if (startTime >= endTime) {
        throw new BadRequestException('hora_inicio debe ser menor que hora_fin');
      }
    }

    const created = await this.repo.createBloqueo({ adminId, titulo: data.titulo, descripcion: data.descripcion, ...data });
    if (!created) throw new NotFoundException('Negocio not found');
    return created;
  }

  async remove(adminId, bloqueoId) {
    const deleted = await this.repo.deleteBloqueo({ adminId, bloqueoId });
    if (!deleted) throw new NotFoundException('Bloqueo not found');
    return { ok: true };
  }
}

Injectable()(AdminBloqueosService);
Inject(AdminBloqueosRepository)(AdminBloqueosService, undefined, 0);

module.exports = { AdminBloqueosService };
