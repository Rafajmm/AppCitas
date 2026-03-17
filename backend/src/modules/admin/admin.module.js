const { Module } = require('@nestjs/common');
const { DbModule } = require('../db/db.module');
const { AdminAuthController } = require('./auth/admin-auth.controller');
const { AdminAuthService } = require('./auth/admin-auth.service');
const { AdminAuthRepository } = require('./auth/admin-auth.repository');
const { JwtAuthGuard } = require('./auth/jwt-auth.guard');
const { AdminNegociosController } = require('./negocios/admin-negocios.controller');
const { AdminNegociosService } = require('./negocios/admin-negocios.service');
const { AdminNegociosRepository } = require('./negocios/admin-negocios.repository');
const { AdminServiciosController } = require('./servicios/admin-servicios.controller');
const { AdminServiciosService } = require('./servicios/admin-servicios.service');
const { AdminServiciosRepository } = require('./servicios/admin-servicios.repository');
const { AdminEmpleadosController } = require('./empleados/admin-empleados.controller');
const { AdminEmpleadosService } = require('./empleados/admin-empleados.service');
const { AdminEmpleadosRepository } = require('./empleados/admin-empleados.repository');
const { AdminEmpleadoServicioController } = require('./empleado-servicio/admin-empleado-servicio.controller');
const { AdminEmpleadoServicioService } = require('./empleado-servicio/admin-empleado-servicio.service');
const { AdminEmpleadoServicioRepository } = require('./empleado-servicio/admin-empleado-servicio.repository');
const { AdminHorariosController } = require('./horarios/admin-horarios.controller');
const { AdminHorariosService } = require('./horarios/admin-horarios.service');
const { AdminHorariosRepository } = require('./horarios/admin-horarios.repository');
const { AdminBloqueosController } = require('./bloqueos/admin-bloqueos.controller');
const { AdminBloqueosService } = require('./bloqueos/admin-bloqueos.service');
const { AdminBloqueosRepository } = require('./bloqueos/admin-bloqueos.repository');
const { AdminCitasController } = require('./citas/admin-citas.controller');
const { AdminCitasService } = require('./citas/admin-citas.service');
const { AdminCitasRepository } = require('./citas/admin-citas.repository');
const { BusinessSchedulesController } = require('./business-schedules/business-schedules.controller');
const { BusinessSchedulesService } = require('./business-schedules/business-schedules.service');
const { BusinessSchedulesRepository } = require('./business-schedules/business-schedules.repository');
const { EmployeeSchedulesController } = require('./employee-schedules/employee-schedules.controller');
const { EmployeeSchedulesService } = require('./employee-schedules/employee-schedules.service');
const { EmployeeSchedulesRepository } = require('./employee-schedules/employee-schedules.repository');

class AdminModule {}

Module({
  imports: [DbModule],
  controllers: [AdminAuthController, AdminNegociosController, AdminServiciosController, AdminEmpleadosController, AdminEmpleadoServicioController, AdminHorariosController, AdminBloqueosController, AdminCitasController, BusinessSchedulesController, EmployeeSchedulesController],
  providers: [
    AdminAuthService,
    AdminAuthRepository,
    JwtAuthGuard,
    AdminNegociosService,
    AdminNegociosRepository,
    AdminServiciosService,
    AdminServiciosRepository,
    AdminEmpleadosService,
    AdminEmpleadosRepository,
    AdminEmpleadoServicioService,
    AdminEmpleadoServicioRepository,
    AdminHorariosService,
    AdminHorariosRepository,
    AdminBloqueosService,
    AdminBloqueosRepository,
    AdminCitasService,
    AdminCitasRepository,
    BusinessSchedulesService,
    BusinessSchedulesRepository,
    EmployeeSchedulesService,
    EmployeeSchedulesRepository,
  ],
})(AdminModule);

module.exports = { AdminModule };
