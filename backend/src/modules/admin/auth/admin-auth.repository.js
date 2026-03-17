const { Inject, Injectable } = require('@nestjs/common');
const { DB_POOL } = require('../../../modules/db/db.providers');

class AdminAuthRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findAdminByEmail(email) {
    const { rows } = await this.pool.query(
      `SELECT id, nombre, email, password_hash, rol, activo
       FROM administradores
       WHERE deleted_at IS NULL AND email = $1
       LIMIT 1`,
      [email],
    );
    return rows[0] || null;
  }
}

Injectable()(AdminAuthRepository);
Inject(DB_POOL)(AdminAuthRepository, undefined, 0);

module.exports = { AdminAuthRepository };
