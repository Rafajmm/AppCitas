const {
  Controller,
  Get,
  Put,
  Req,
  Inject,
  UseGuards,
  BadRequestException,
} = require('@nestjs/common');
const { JwtAuthGuard } = require('../auth/jwt-auth.guard');
const { AdminHorariosService } = require('./admin-horarios.service');
const {
  uuidV4,
  updateHorariosNegocioSchema,
  updateHorariosEmpleadoSchema,
} = require('./admin-horarios.schemas');

class AdminHorariosController {
  constructor(service) {
    this.service = service;
  }

  async getHorariosNegocio(req) {
    const negocioId = req.params.negocioId;
    const { error: idErr } = uuidV4.required().validate(negocioId);
    if (idErr) throw new BadRequestException(['Invalid negocioId']);

    return await this.service.getHorariosNegocio(req.user.adminId, negocioId);
  }

  async updateHorariosNegocio(req) {
    const negocioId = req.params.negocioId;
    const { error: idErr } = uuidV4.required().validate(negocioId);
    if (idErr) throw new BadRequestException(['Invalid negocioId']);

    const { value, error } = updateHorariosNegocioSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.service.updateHorariosNegocio(req.user.adminId, negocioId, value.horarios);
  }

  async getHorariosEmpleado(req) {
    const empleadoId = req.params.empleadoId;
    const { error: idErr } = uuidV4.required().validate(empleadoId);
    if (idErr) throw new BadRequestException(['Invalid empleadoId']);

    return await this.service.getHorariosEmpleado(req.user.adminId, empleadoId);
  }

  async updateHorariosEmpleado(req) {
    const empleadoId = req.params.empleadoId;
    const { error: idErr } = uuidV4.required().validate(empleadoId);
    if (idErr) throw new BadRequestException(['Invalid empleadoId']);

    const { value, error } = updateHorariosEmpleadoSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.service.updateHorariosEmpleado(req.user.adminId, empleadoId, value.horarios);
  }
}

Controller('admin/horarios')(AdminHorariosController);
UseGuards(JwtAuthGuard)(AdminHorariosController);
Inject(AdminHorariosService)(AdminHorariosController, undefined, 0);

Get('negocio/:negocioId')(AdminHorariosController.prototype, 'getHorariosNegocio', Object.getOwnPropertyDescriptor(AdminHorariosController.prototype, 'getHorariosNegocio'));
Req()(AdminHorariosController.prototype, 'getHorariosNegocio', 0);

Put('negocio/:negocioId')(AdminHorariosController.prototype, 'updateHorariosNegocio', Object.getOwnPropertyDescriptor(AdminHorariosController.prototype, 'updateHorariosNegocio'));
Req()(AdminHorariosController.prototype, 'updateHorariosNegocio', 0);

Get('empleado/:empleadoId')(AdminHorariosController.prototype, 'getHorariosEmpleado', Object.getOwnPropertyDescriptor(AdminHorariosController.prototype, 'getHorariosEmpleado'));
Req()(AdminHorariosController.prototype, 'getHorariosEmpleado', 0);

Put('empleado/:empleadoId')(AdminHorariosController.prototype, 'updateHorariosEmpleado', Object.getOwnPropertyDescriptor(AdminHorariosController.prototype, 'updateHorariosEmpleado'));
Req()(AdminHorariosController.prototype, 'updateHorariosEmpleado', 0);

module.exports = { AdminHorariosController };
