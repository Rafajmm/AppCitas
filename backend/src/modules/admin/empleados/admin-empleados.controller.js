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
const { AdminEmpleadosService } = require('./admin-empleados.service');
const {
  uuidV4,
  listEmpleadosQuerySchema,
  createEmpleadoSchema,
  updateEmpleadoSchema,
} = require('./admin-empleados.schemas');

class AdminEmpleadosController {
  constructor(service) {
    this.service = service;
  }

  async list(req) {
    const { value, error } = listEmpleadosQuerySchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.service.list(req.user.adminId, value.negocioId);
  }

  async create(req) {
    const { value, error } = createEmpleadoSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.service.create(req.user.adminId, value);
  }

  async update(req) {
    const empleadoId = req.params.id;
    const { error: idErr } = uuidV4.required().validate(empleadoId);
    if (idErr) throw new BadRequestException(['Invalid empleadoId']);

    const { value, error } = updateEmpleadoSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.service.update(req.user.adminId, empleadoId, value);
  }

  async remove(req) {
    const empleadoId = req.params.id;
    const { error: idErr } = uuidV4.required().validate(empleadoId);
    if (idErr) throw new BadRequestException(['Invalid empleadoId']);

    return await this.service.remove(req.user.adminId, empleadoId);
  }
}

Controller('admin/empleados')(AdminEmpleadosController);
UseGuards(JwtAuthGuard)(AdminEmpleadosController);
Inject(AdminEmpleadosService)(AdminEmpleadosController, undefined, 0);

Get('')(AdminEmpleadosController.prototype, 'list', Object.getOwnPropertyDescriptor(AdminEmpleadosController.prototype, 'list'));
Req()(AdminEmpleadosController.prototype, 'list', 0);

Post('')(AdminEmpleadosController.prototype, 'create', Object.getOwnPropertyDescriptor(AdminEmpleadosController.prototype, 'create'));
Req()(AdminEmpleadosController.prototype, 'create', 0);

Put(':id')(AdminEmpleadosController.prototype, 'update', Object.getOwnPropertyDescriptor(AdminEmpleadosController.prototype, 'update'));
Req()(AdminEmpleadosController.prototype, 'update', 0);

Delete(':id')(AdminEmpleadosController.prototype, 'remove', Object.getOwnPropertyDescriptor(AdminEmpleadosController.prototype, 'remove'));
Req()(AdminEmpleadosController.prototype, 'remove', 0);

module.exports = { AdminEmpleadosController };
