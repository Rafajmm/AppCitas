const {
  Controller,
  Get,
  Patch,
  Req,
  Inject,
  UseGuards,
  BadRequestException,
} = require('@nestjs/common');
const { JwtAuthGuard } = require('../auth/jwt-auth.guard');
const { AdminCitasService } = require('./admin-citas.service');
const {
  uuidV4,
  listCitasQuerySchema,
  updateCitaStatusSchema,
} = require('./admin-citas.schemas');

class AdminCitasController {
  constructor(service) {
    this.service = service;
  }

  async list(req) {
    const { value, error } = listCitasQuerySchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.service.list(req.user.adminId, value);
  }

  async updateStatus(req) {
    const citaId = req.params.id;
    const { error: idErr } = uuidV4.required().validate(citaId);
    if (idErr) throw new BadRequestException(['Invalid citaId']);

    const { value, error } = updateCitaStatusSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.service.updateStatus(req.user.adminId, citaId, value.estado);
  }
}

Controller('admin/citas')(AdminCitasController);
UseGuards(JwtAuthGuard)(AdminCitasController);
Inject(AdminCitasService)(AdminCitasController, undefined, 0);

Get('')(AdminCitasController.prototype, 'list', Object.getOwnPropertyDescriptor(AdminCitasController.prototype, 'list'));
Req()(AdminCitasController.prototype, 'list', 0);

Patch(':id')(AdminCitasController.prototype, 'updateStatus', Object.getOwnPropertyDescriptor(AdminCitasController.prototype, 'updateStatus'));
Req()(AdminCitasController.prototype, 'updateStatus', 0);

module.exports = { AdminCitasController };
