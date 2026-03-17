const {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Req,
  Inject,
  UseGuards,
  BadRequestException,
} = require('@nestjs/common');
const { JwtAuthGuard } = require('../auth/jwt-auth.guard');
const { AdminServiciosService } = require('./admin-servicios.service');
const {
  uuidV4,
  listServiciosQuerySchema,
  createServicioSchema,
  updateServicioSchema,
} = require('./admin-servicios.schemas');

class AdminServiciosController {
  constructor(service) {
    this.service = service;
  }

  async list(req) {
    const { value, error } = listServiciosQuerySchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.service.list(req.user.adminId, value.negocioId);
  }

  async create(req) {
    const { value, error } = createServicioSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.service.create(req.user.adminId, value);
  }

  async update(req) {
    const servicioId = req.params.id;
    const { error: idErr } = uuidV4.required().validate(servicioId);
    if (idErr) throw new BadRequestException(['Invalid servicioId']);

    const { value, error } = updateServicioSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.service.update(req.user.adminId, servicioId, value);
  }

  async remove(req) {
    const servicioId = req.params.id;
    const { error: idErr } = uuidV4.required().validate(servicioId);
    if (idErr) throw new BadRequestException(['Invalid servicioId']);

    return await this.service.remove(req.user.adminId, servicioId);
  }
}

Controller('admin/servicios')(AdminServiciosController);
UseGuards(JwtAuthGuard)(AdminServiciosController);
Inject(AdminServiciosService)(AdminServiciosController, undefined, 0);

Get('')(AdminServiciosController.prototype, 'list', Object.getOwnPropertyDescriptor(AdminServiciosController.prototype, 'list'));
Req()(AdminServiciosController.prototype, 'list', 0);

Post('')(AdminServiciosController.prototype, 'create', Object.getOwnPropertyDescriptor(AdminServiciosController.prototype, 'create'));
Req()(AdminServiciosController.prototype, 'create', 0);

Put(':id')(AdminServiciosController.prototype, 'update', Object.getOwnPropertyDescriptor(AdminServiciosController.prototype, 'update'));
Req()(AdminServiciosController.prototype, 'update', 0);

Delete(':id')(AdminServiciosController.prototype, 'remove', Object.getOwnPropertyDescriptor(AdminServiciosController.prototype, 'remove'));
Req()(AdminServiciosController.prototype, 'remove', 0);

module.exports = { AdminServiciosController };
