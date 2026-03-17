const { Inject, Injectable, BadRequestException } = require('@nestjs/common');
const bcrypt = require('bcryptjs');
const { DB_POOL } = require('../db/db.providers');

class SuperadminRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async getDashboardStats() {
    const [totalNegocios, negociosActivos, totalAdmins, adminsActivos, totalCitas, citasEsteMes, citasHoy] = await Promise.all([
      this.pool.query('SELECT COUNT(*) as count FROM negocios WHERE deleted_at IS NULL'),
      this.pool.query('SELECT COUNT(*) as count FROM negocios WHERE activo = true AND deleted_at IS NULL'),
      this.pool.query('SELECT COUNT(*) as count FROM administradores WHERE deleted_at IS NULL'),
      this.pool.query('SELECT COUNT(*) as count FROM administradores WHERE activo = true AND deleted_at IS NULL'),
      this.pool.query('SELECT COUNT(*) as count FROM citas'),
      this.pool.query("SELECT COUNT(*) as count FROM citas WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)"),
      this.pool.query("SELECT COUNT(*) as count FROM citas WHERE fecha = CURRENT_DATE"),
    ]);

    return {
      totalNegocios: parseInt(totalNegocios.rows[0].count),
      negociosActivos: parseInt(negociosActivos.rows[0].count),
      totalAdmins: parseInt(totalAdmins.rows[0].count),
      adminsActivos: parseInt(adminsActivos.rows[0].count),
      totalCitas: parseInt(totalCitas.rows[0].count),
      citasEsteMes: parseInt(citasEsteMes.rows[0].count),
      citasHoy: parseInt(citasHoy.rows[0].count),
    };
  }

  async getNegociosRecientes(limit = 5) {
    const { rows } = await this.pool.query(
      'SELECT id, nombre, slug, created_at FROM negocios WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1',
      [limit],
    );
    return rows;
  }

  async getAdminsRecientes(limit = 5) {
    const { rows } = await this.pool.query(
      'SELECT id, nombre, email, rol, created_at FROM administradores WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1',
      [limit],
    );
    return rows;
  }

  async listAdministadores({ page = 1, limit = 20, activo }) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE deleted_at IS NULL';
    const params = [];
    let paramIndex = 1;

    if (activo !== undefined) {
      whereClause += ` AND activo = $${paramIndex}`;
      params.push(activo);
      paramIndex++;
    }

    params.push(limit, offset);

    const { rows } = await this.pool.query(
      `SELECT id, nombre, email, telefono, rol, activo, created_at, updated_at 
       FROM administradores ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params,
    );

    let countWhereClause = whereClause;
    const countParams = params.slice(0, activo !== undefined ? 1 : 0);
    
    const countResult = await this.pool.query(
      `SELECT COUNT(*) FROM administradores ${countWhereClause}`,
      countParams,
    );

    return {
      data: rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
    };
  }

  async createAdmin({ nombre, email, password, telefono, rol = 'admin' }) {
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await this.pool.query(
      `INSERT INTO administradores (nombre, email, password_hash, telefono, rol)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, email, telefono, rol, activo, created_at`,
      [nombre, email, passwordHash, telefono, rol],
    );
    return rows[0];
  }

  async findAdminById(id) {
    const { rows } = await this.pool.query(
      'SELECT id, nombre, email, telefono, rol, activo, created_at FROM administradores WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return rows[0] || null;
  }

  async findAdminByEmail(email) {
    const { rows } = await this.pool.query(
      'SELECT id FROM administradores WHERE email = $1 AND deleted_at IS NULL',
      [email],
    );
    return rows[0] || null;
  }

  async updateAdmin(id, data) {
    const fields = [];
    const values = [id];
    let idx = 2;

    if (data.password) {
      data.password_hash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }

    for (const [k, v] of Object.entries(data)) {
      fields.push(`${k} = $${idx}`);
      values.push(v);
      idx += 1;
    }

    if (!fields.length) return null;

    const { rows } = await this.pool.query(
      `UPDATE administradores SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, nombre, email, telefono, rol, activo, created_at`,
      values,
    );

    return rows[0] || null;
  }

  async deactivateAdmin(id) {
    const { rows } = await this.pool.query(
      `UPDATE administradores SET activo = false, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id],
    );
    return rows[0] || null;
  }

  async listNegocios({ page = 1, limit = 20, activo }) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE deleted_at IS NULL';
    const params = [];
    let paramIndex = 1;

    if (activo !== undefined) {
      whereClause += ` AND activo = $${paramIndex}`;
      params.push(activo);
      paramIndex++;
    }

    params.push(limit, offset);

    const { rows } = await this.pool.query(
      `SELECT * FROM negocios ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params,
    );

    let countWhereClause = whereClause;
    const countParams = params.slice(0, activo !== undefined ? 1 : 0);

    const countResult = await this.pool.query(
      `SELECT COUNT(*) FROM negocios ${countWhereClause}`,
      countParams,
    );

    return {
      data: rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
    };
  }

  async findNegocioById(id) {
    const { rows } = await this.pool.query(
      'SELECT * FROM negocios WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return rows[0] || null;
  }

  async findNegocioBySlug(slug) {
    const { rows } = await this.pool.query(
      'SELECT id FROM negocios WHERE slug = $1 AND deleted_at IS NULL',
      [slug],
    );
    return rows[0] || null;
  }

  async createNegocio(data) {
    const { rows } = await this.pool.query(
      `INSERT INTO negocios (nombre, slug, descripcion, direccion, telefono, email, color_primario, color_secundario, color_acento, whatsapp, web_url, reservas_habilitadas, antelacion_minima_horas, tiempo_confirmacion_minutos, id_admin)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        data.nombre, data.slug, data.descripcion, data.direccion, data.telefono, data.email,
        data.color_primario, data.color_secundario, data.color_acento, data.whatsapp, data.web_url,
        data.reservas_habilitadas, data.antelacion_minima_horas, data.tiempo_confirmacion_minutos,
        data.id_admin,
      ],
    );
    return rows[0];
  }

  async updateNegocio(id, data) {
    const fields = [];
    const values = [id];
    let idx = 2;

    for (const [k, v] of Object.entries(data)) {
      fields.push(`${k} = $${idx}`);
      values.push(v);
      idx += 1;
    }

    if (!fields.length) return null;

    const { rows } = await this.pool.query(
      `UPDATE negocios SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      values,
    );

    return rows[0] || null;
  }

  async deactivateNegocio(id) {
    const { rows } = await this.pool.query(
      `UPDATE negocios SET activo = false, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id],
    );
    return rows[0] || null;
  }

  async getAdminsByNegocio(negocioId) {
    const { rows } = await this.pool.query(
      `SELECT a.id, a.nombre, a.email, a.rol, a.activo, n.created_at as asignado_en
       FROM administradores a
       JOIN negocios n ON a.id = n.id_admin
       WHERE n.id = $1 AND a.deleted_at IS NULL AND n.deleted_at IS NULL`,
      [negocioId],
    );
    return rows;
  }

  async asignarAdmins(negocioId, administradorIds) {
    // Since we're using 1-to-1 relationship, take the first admin
    const adminId = administradorIds[0];
    if (!adminId) return false;

    const { rows } = await this.pool.query(
      `UPDATE negocios 
       SET id_admin = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [adminId, negocioId],
    );
    
    return rows.length > 0;
  }

  async getNegocioEstadisticas(negocioId) {
    const [[negocio], [citas], [citasConfirmadas], [citasPendientes], [citasCanceladas], [citasCompletadas], [citasEsteMes], [empleados], [servicios]] = await Promise.all([
      this.pool.query('SELECT id, nombre FROM negocios WHERE id = $1 AND deleted_at IS NULL', [negocioId]),
      this.pool.query('SELECT COUNT(*) as count FROM citas WHERE negocio_id = $1', [negocioId]),
      this.pool.query("SELECT COUNT(*) as count FROM citas WHERE negocio_id = $1 AND estado = 'confirmada'", [negocioId]),
      this.pool.query("SELECT COUNT(*) as count FROM citas WHERE negocio_id = $1 AND estado = 'pendiente'", [negocioId]),
      this.pool.query("SELECT COUNT(*) as count FROM citas WHERE negocio_id = $1 AND estado = 'cancelada'", [negocioId]),
      this.pool.query("SELECT COUNT(*) as count FROM citas WHERE negocio_id = $1 AND estado = 'completada'", [negocioId]),
      this.pool.query("SELECT COUNT(*) as count FROM citas WHERE negocio_id = $1 AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)", [negocioId]),
      this.pool.query('SELECT COUNT(*) as count FROM empleados WHERE negocio_id = $1 AND activo = true AND deleted_at IS NULL', [negocioId]),
      this.pool.query('SELECT COUNT(*) as count FROM servicios WHERE negocio_id = $1 AND activo = true AND deleted_at IS NULL', [negocioId]),
    ]);

    if (!negocio.rows[0]) return null;

    const [{ ingresos }] = await this.pool.query(
      "SELECT COALESCE(SUM(precio_total), 0) as ingresos FROM citas WHERE negocio_id = $1 AND estado = 'completada'",
      [negocioId],
    );

    return {
      negocioId: negocio.rows[0].id,
      nombre: negocio.rows[0].nombre,
      totalCitas: parseInt(citas.rows[0].count),
      citasConfirmadas: parseInt(citasConfirmadas.rows[0].count),
      citasPendientes: parseInt(citasPendientes.rows[0].count),
      citasCanceladas: parseInt(citasCanceladas.rows[0].count),
      citasCompletadas: parseInt(citasCompletadas.rows[0].count),
      empleadosActivos: parseInt(empleados.rows[0].count),
      serviciosActivos: parseInt(servicios.rows[0].count),
      citasEsteMes: parseInt(citasEsteMes.rows[0].count),
      ingresosEstimados: parseFloat(ingresos.ingresos) || 0,
    };
  }
}

Injectable()(SuperadminRepository);
Inject(DB_POOL)(SuperadminRepository, undefined, 0);

module.exports = { SuperadminRepository };
