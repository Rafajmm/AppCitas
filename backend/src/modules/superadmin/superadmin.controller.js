const { Controller, Get, Post, Patch, Req, Inject, UseGuards, BadRequestException } = require('@nestjs/common');
const { SuperadminService } = require('./superadmin.service');
const { SuperadminGuard } = require('./superadmin.guard');
const { JwtAuthGuard } = require('../admin/auth/jwt-auth.guard');
const { crearAdminSchema, actualizarAdminSchema, crearNegocioSchema, actualizarNegocioSchema, asignarAdminsSchema, uuidSchema, paginationSchema } = require('./superadmin.schemas');

class SuperadminController {
  constructor(service) {
    this.service = service;
  }

  async dashboard(req) {
    return await this.service.getDashboard(req.user);
  }

  async listAdministadores(req) {
    const { value: query, error } = paginationSchema.validate(req.query, { stripUnknown: true });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));
    return await this.service.listAdministadores(query);
  }

  async createAdmin(req) {
    const { value: data, error } = crearAdminSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));
    return await this.service.createAdmin(data, req.user);
  }

  async getAdmin(req) {
    const adminId = req.params.adminId;
    const { error } = uuidSchema.validate(adminId);
    if (error) throw new BadRequestException(['Invalid adminId']);
    return await this.service.getAdmin(adminId);
  }

  async updateAdmin(req) {
    const adminId = req.params.adminId;
    const { error: idErr } = uuidSchema.validate(adminId);
    if (idErr) throw new BadRequestException(['Invalid adminId']);

    const { value: data, error } = actualizarAdminSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.service.updateAdmin(adminId, data, req.user);
  }

  async deactivateAdmin(req) {
    const adminId = req.params.adminId;
    const { error } = uuidSchema.validate(adminId);
    if (error) throw new BadRequestException(['Invalid adminId']);
    return await this.service.deactivateAdmin(adminId);
  }

  async listNegocios(req) {
    const { value: query, error } = paginationSchema.validate(req.query, { stripUnknown: true });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));
    return await this.service.listNegocios(query);
  }

  async createNegocio(req) {
    const { value: data, error } = crearNegocioSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));
    return await this.service.createNegocio(data);
  }

  async getNegocio(req) {
    const negocioId = req.params.negocioId;
    const { error } = uuidSchema.validate(negocioId);
    if (error) throw new BadRequestException(['Invalid negocioId']);
    return await this.service.getNegocio(negocioId);
  }

  async updateNegocio(req) {
    const negocioId = req.params.negocioId;
    const { error: idErr } = uuidSchema.validate(negocioId);
    if (idErr) throw new BadRequestException(['Invalid negocioId']);

    const { value: data, error } = actualizarNegocioSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.service.updateNegocio(negocioId, data);
  }

  async deactivateNegocio(req) {
    const negocioId = req.params.negocioId;
    const { error } = uuidSchema.validate(negocioId);
    if (error) throw new BadRequestException(['Invalid negocioId']);
    return await this.service.deactivateNegocio(negocioId);
  }

  async getAdminsByNegocio(req) {
    const negocioId = req.params.negocioId;
    const { error } = uuidSchema.validate(negocioId);
    if (error) throw new BadRequestException(['Invalid negocioId']);
    return await this.service.getAdminsByNegocio(negocioId);
  }

  async asignarAdmins(req) {
    const negocioId = req.params.negocioId;
    const { error: idErr } = uuidSchema.validate(negocioId);
    if (idErr) throw new BadRequestException(['Invalid negocioId']);

    const { value: data, error } = asignarAdminsSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.service.asignarAdmins(negocioId, data.administrador_ids);
  }

  async getNegocioEstadisticas(req) {
    const negocioId = req.params.negocioId;
    const { error } = uuidSchema.validate(negocioId);
    if (error) throw new BadRequestException(['Invalid negocioId']);
    return await this.service.getNegocioEstadisticas(negocioId);
  }
}

Controller('superadmin')(SuperadminController);
UseGuards(JwtAuthGuard, SuperadminGuard)(SuperadminController);
Inject(SuperadminService)(SuperadminController, undefined, 0);

Get('dashboard')(SuperadminController.prototype, 'dashboard', Object.getOwnPropertyDescriptor(SuperadminController.prototype, 'dashboard'));
Req()(SuperadminController.prototype, 'dashboard', 0);

Get('administradores')(SuperadminController.prototype, 'listAdministadores', Object.getOwnPropertyDescriptor(SuperadminController.prototype, 'listAdministadores'));
Req()(SuperadminController.prototype, 'listAdministadores', 0);

Post('administradores')(SuperadminController.prototype, 'createAdmin', Object.getOwnPropertyDescriptor(SuperadminController.prototype, 'createAdmin'));
Req()(SuperadminController.prototype, 'createAdmin', 0);

Get('administradores/:adminId')(SuperadminController.prototype, 'getAdmin', Object.getOwnPropertyDescriptor(SuperadminController.prototype, 'getAdmin'));
Req()(SuperadminController.prototype, 'getAdmin', 0);

Patch('administradores/:adminId')(SuperadminController.prototype, 'updateAdmin', Object.getOwnPropertyDescriptor(SuperadminController.prototype, 'updateAdmin'));
Req()(SuperadminController.prototype, 'updateAdmin', 0);

Patch('administradores/:adminId/desactivar')(SuperadminController.prototype, 'deactivateAdmin', Object.getOwnPropertyDescriptor(SuperadminController.prototype, 'deactivateAdmin'));
Req()(SuperadminController.prototype, 'deactivateAdmin', 0);

Get('negocios')(SuperadminController.prototype, 'listNegocios', Object.getOwnPropertyDescriptor(SuperadminController.prototype, 'listNegocios'));
Req()(SuperadminController.prototype, 'listNegocios', 0);

Post('negocios')(SuperadminController.prototype, 'createNegocio', Object.getOwnPropertyDescriptor(SuperadminController.prototype, 'createNegocio'));
Req()(SuperadminController.prototype, 'createNegocio', 0);

Get('negocios/:negocioId')(SuperadminController.prototype, 'getNegocio', Object.getOwnPropertyDescriptor(SuperadminController.prototype, 'getNegocio'));
Req()(SuperadminController.prototype, 'getNegocio', 0);

Patch('negocios/:negocioId')(SuperadminController.prototype, 'updateNegocio', Object.getOwnPropertyDescriptor(SuperadminController.prototype, 'updateNegocio'));
Req()(SuperadminController.prototype, 'updateNegocio', 0);

Patch('negocios/:negocioId/desactivar')(SuperadminController.prototype, 'deactivateNegocio', Object.getOwnPropertyDescriptor(SuperadminController.prototype, 'deactivateNegocio'));
Req()(SuperadminController.prototype, 'deactivateNegocio', 0);

Get('negocios/:negocioId/admins')(SuperadminController.prototype, 'getAdminsByNegocio', Object.getOwnPropertyDescriptor(SuperadminController.prototype, 'getAdminsByNegocio'));
Req()(SuperadminController.prototype, 'getAdminsByNegocio', 0);

Post('negocios/:negocioId/asignar-admin')(SuperadminController.prototype, 'asignarAdmins', Object.getOwnPropertyDescriptor(SuperadminController.prototype, 'asignarAdmins'));
Req()(SuperadminController.prototype, 'asignarAdmins', 0);

Get('negocios/:negocioId/estadisticas')(SuperadminController.prototype, 'getNegocioEstadisticas', Object.getOwnPropertyDescriptor(SuperadminController.prototype, 'getNegocioEstadisticas'));
Req()(SuperadminController.prototype, 'getNegocioEstadisticas', 0);

module.exports = { SuperadminController };
