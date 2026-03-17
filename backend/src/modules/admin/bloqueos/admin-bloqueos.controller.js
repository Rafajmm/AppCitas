const {
  Controller,
  Get,
  Post,
  Delete,
  Req,
  Inject,
  UseGuards,
  BadRequestException,
} = require('@nestjs/common');
const { JwtAuthGuard } = require('../auth/jwt-auth.guard');
const { AdminBloqueosService } = require('./admin-bloqueos.service');
const {
  uuidV4,
  listBloqueosQuerySchema,
  createBloqueoSchema,
} = require('./admin-bloqueos.schemas');

class AdminBloqueosController {
  constructor(service) {
    this.service = service;
  }

  async list(req) {
    const { value, error } = listBloqueosQuerySchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.service.list(req.user.adminId, value);
  }

  async create(req) {
    const { value, error } = createBloqueoSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.service.create(req.user.adminId, value);
  }

  async remove(req) {
    const bloqueoId = req.params.id;
    const { error: idErr } = uuidV4.required().validate(bloqueoId);
    if (idErr) throw new BadRequestException(['Invalid bloqueoId']);

    return await this.service.remove(req.user.adminId, bloqueoId);
  }
}

Controller('admin/bloqueos')(AdminBloqueosController);
UseGuards(JwtAuthGuard)(AdminBloqueosController);
Inject(AdminBloqueosService)(AdminBloqueosController, undefined, 0);

Get('')(AdminBloqueosController.prototype, 'list', Object.getOwnPropertyDescriptor(AdminBloqueosController.prototype, 'list'));
Req()(AdminBloqueosController.prototype, 'list', 0);

Post('')(AdminBloqueosController.prototype, 'create', Object.getOwnPropertyDescriptor(AdminBloqueosController.prototype, 'create'));
Req()(AdminBloqueosController.prototype, 'create', 0);

Delete(':id')(AdminBloqueosController.prototype, 'remove', Object.getOwnPropertyDescriptor(AdminBloqueosController.prototype, 'remove'));
Req()(AdminBloqueosController.prototype, 'remove', 0);

module.exports = { AdminBloqueosController };
