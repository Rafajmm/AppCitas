const { Inject, Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } = require('@nestjs/common');
const { SuperadminRepository } = require('./superadmin.repository');

class SuperadminService {
  constructor(repo) {
    this.repo = repo;
  }

  async getDashboard(currentUser) {
    const [stats, negociosRecientes, adminsRecientes] = await Promise.all([
      this.repo.getDashboardStats(),
      this.repo.getNegociosRecientes(5),
      this.repo.getAdminsRecientes(5),
    ]);

    return {
      ...stats,
      negociosRecientes,
      adminsRecientes,
    };
  }

  async listAdministadores(query) {
    return await this.repo.listAdministadores(query);
  }

  async createAdmin(data, currentUser) {
    if (data.rol === 'superadmin' && currentUser.rol !== 'superadmin') {
      throw new ForbiddenException('Only superadmins can create superadmin users');
    }

    const existingEmail = await this.repo.findAdminByEmail(data.email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    return await this.repo.createAdmin(data);
  }

  async getAdmin(id) {
    const admin = await this.repo.findAdminById(id);
    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }
    return admin;
  }

  async updateAdmin(id, data, currentUser) {
    if (data.rol === 'superadmin' && currentUser.rol !== 'superadmin') {
      throw new ForbiddenException('Only superadmins can assign superadmin role');
    }

    const admin = await this.repo.findAdminById(id);
    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }

    if (data.email && data.email !== admin.email) {
      const existingEmail = await this.repo.findAdminByEmail(data.email);
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    return await this.repo.updateAdmin(id, data);
  }

  async deactivateAdmin(id) {
    const admin = await this.repo.findAdminById(id);
    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }

    return await this.repo.deactivateAdmin(id);
  }

  async listNegocios(query) {
    return await this.repo.listNegocios(query);
  }

  async createNegocio(data) {
    const existingSlug = await this.repo.findNegocioBySlug(data.slug);
    if (existingSlug) {
      throw new ConflictException('Slug already exists');
    }

    // If id_admin is provided, validate it
    if (data.id_admin) {
      const admin = await this.repo.findAdminById(data.id_admin);
      if (!admin) {
        throw new NotFoundException('Administrator not found');
      }
    }

    return await this.repo.createNegocio(data);
  }

  async getNegocio(id) {
    const negocio = await this.repo.findNegocioById(id);
    if (!negocio) {
      throw new NotFoundException('Negocio not found');
    }
    return negocio;
  }

  async updateNegocio(id, data) {
    const negocio = await this.repo.findNegocioById(id);
    if (!negocio) {
      throw new NotFoundException('Negocio not found');
    }

    if (data.slug && data.slug !== negocio.slug) {
      const existingSlug = await this.repo.findNegocioBySlug(data.slug);
      if (existingSlug) {
        throw new ConflictException('Slug already exists');
      }
    }

    return await this.repo.updateNegocio(id, data);
  }

  async deactivateNegocio(id) {
    const negocio = await this.repo.findNegocioById(id);
    if (!negocio) {
      throw new NotFoundException('Negocio not found');
    }

    return await this.repo.deactivateNegocio(id);
  }

  async getAdminsByNegocio(negocioId) {
    const negocio = await this.repo.findNegocioById(negocioId);
    if (!negocio) {
      throw new NotFoundException('Negocio not found');
    }

    return await this.repo.getAdminsByNegocio(negocioId);
  }

  async asignarAdmins(negocioId, administradorIds) {
    const negocio = await this.repo.findNegocioById(negocioId);
    if (!negocio) {
      throw new NotFoundException('Negocio not found');
    }

    // For 1-to-1 relationship, take only the first admin
    const adminId = administradorIds[0];
    if (!adminId) {
      throw new BadRequestException('At least one administrator must be provided');
    }

    const admin = await this.repo.findAdminById(adminId);
    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }

    return await this.repo.asignarAdmins(negocioId, [adminId]);
  }

  async getNegocioEstadisticas(negocioId) {
    const negocio = await this.repo.findNegocioById(negocioId);
    if (!negocio) {
      throw new NotFoundException('Negocio not found');
    }

    return await this.repo.getNegocioEstadisticas(negocioId);
  }
}

Injectable()(SuperadminService);
Inject(SuperadminRepository)(SuperadminService, undefined, 0);

module.exports = { SuperadminService };
