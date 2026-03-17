const { Inject, Injectable, UnauthorizedException } = require('@nestjs/common');
const bcrypt = require('bcryptjs');
const { AdminAuthRepository } = require('./admin-auth.repository');
const { signAdminToken } = require('./jwt');

class AdminAuthService {
  constructor(repo) {
    this.repo = repo;
  }

  async login(email, password) {
    const admin = await this.repo.findAdminByEmail(email);
    if (!admin || !admin.activo) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = signAdminToken({
      adminId: admin.id,
      rol: admin.rol,
      email: admin.email,
    });

    return {
      token,
      admin: {
        id: admin.id,
        nombre: admin.nombre,
        email: admin.email,
        rol: admin.rol,
      },
    };
  }
}

Injectable()(AdminAuthService);
Inject(AdminAuthRepository)(AdminAuthService, undefined, 0);

module.exports = { AdminAuthService };
