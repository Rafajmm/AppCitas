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
const { AdminEmpleadoServicioService } = require('./admin-empleado-servicio.service');
const {
  uuidV4,
  listServiciosByEmpleadoQuerySchema,
  assignServicioSchema,
} = require('./admin-empleado-servicio.schemas');

class AdminEmpleadoServicioController {
  constructor(service) {
    this.service = service;
  }

  async listByEmpleado(req) {
    const empleadoId = req.params.empleadoId;
    const { error: idErr } = uuidV4.required().validate(empleadoId);
    if (idErr) throw new BadRequestException(['Invalid empleadoId']);

    return await this.service.listServiciosByEmpleado(req.user.adminId, empleadoId);
  }

  async assign(req) {
    const { value, error } = assignServicioSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.service.assignServicio(req.user.adminId, value);
  }

  async unassign(req) {
    const empleadoId = req.params.empleadoId;
    const servicioId = req.params.servicioId;
    
    const { error: empErr } = uuidV4.required().validate(empleadoId);
    const { error: servErr } = uuidV4.required().validate(servicioId);
    if (empErr || servErr) throw new BadRequestException(['Invalid empleadoId or servicioId']);

    return await this.service.unassignServicio(req.user.adminId, empleadoId, servicioId);
  }
}

Controller('admin/empleado-servicio')(AdminEmpleadoServicioController);
UseGuards(JwtAuthGuard)(AdminEmpleadoServicioController);
Inject(AdminEmpleadoServicioService)(AdminEmpleadoServicioController, undefined, 0);

Get(':empleadoId')(AdminEmpleadoServicioController.prototype, 'listByEmpleado', Object.getOwnPropertyDescriptor(AdminEmpleadoServicioController.prototype, 'listByEmpleado'));
Req()(AdminEmpleadoServicioController.prototype, 'listByEmpleado', 0);

Post('')(AdminEmpleadoServicioController.prototype, 'assign', Object.getOwnPropertyDescriptor(AdminEmpleadoServicioController.prototype, 'assign'));
Req()(AdminEmpleadoServicioController.prototype, 'assign', 0);

Delete(':empleadoId/:servicioId')(AdminEmpleadoServicioController.prototype, 'unassign', Object.getOwnPropertyDescriptor(AdminEmpleadoServicioController.prototype, 'unassign'));
Req()(AdminEmpleadoServicioController.prototype, 'unassign', 0);

module.exports = { AdminEmpleadoServicioController };
