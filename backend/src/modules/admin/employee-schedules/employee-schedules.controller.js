const { Controller, Get, Put, Param, Body, UseGuards, Req, BadRequestException, Inject } = require('@nestjs/common');
const { JwtAuthGuard } = require('../auth/jwt-auth.guard');
const { EmployeeSchedulesService } = require('./employee-schedules.service');
const { employeeSchemas } = require('./employee-schedules.schemas');

class EmployeeSchedulesController {
  constructor(employeeSchedulesService) {
    this.employeeSchedulesService = employeeSchedulesService;
  }

  async getEmployeeSchedules(params, req) {
    const { employeeId } = params;
    return await this.employeeSchedulesService.getEmployeeSchedules(req.user.adminId, employeeId);
  }

  async updateEmployeeSchedules(params, body, req) {
    const { employeeId } = params;
    
    // Validate request body
    const { value, error } = employeeSchemas.updateEmployeeSchedules.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));
    
    const { schedules } = value;
    return await this.employeeSchedulesService.updateEmployeeSchedules(req.user.adminId, employeeId, schedules);
  }
}

// Add decorators following the app pattern
Inject(EmployeeSchedulesService)(EmployeeSchedulesController, undefined, 0);

Get(':employeeId')(EmployeeSchedulesController.prototype, 'getEmployeeSchedules', Object.getOwnPropertyDescriptor(EmployeeSchedulesController.prototype, 'getEmployeeSchedules'));
Param('employeeId')(EmployeeSchedulesController.prototype, 'getEmployeeSchedules', 0);
Req()(EmployeeSchedulesController.prototype, 'getEmployeeSchedules', 1);
UseGuards(JwtAuthGuard)(EmployeeSchedulesController.prototype, 'getEmployeeSchedules', Object.getOwnPropertyDescriptor(EmployeeSchedulesController.prototype, 'getEmployeeSchedules'));

Put(':employeeId')(EmployeeSchedulesController.prototype, 'updateEmployeeSchedules', Object.getOwnPropertyDescriptor(EmployeeSchedulesController.prototype, 'updateEmployeeSchedules'));
Param('employeeId')(EmployeeSchedulesController.prototype, 'updateEmployeeSchedules', 0);
Body()(EmployeeSchedulesController.prototype, 'updateEmployeeSchedules', 1);
Req()(EmployeeSchedulesController.prototype, 'updateEmployeeSchedules', 2);
UseGuards(JwtAuthGuard)(EmployeeSchedulesController.prototype, 'updateEmployeeSchedules', Object.getOwnPropertyDescriptor(EmployeeSchedulesController.prototype, 'updateEmployeeSchedules'));

Controller('admin/employee-schedules')(EmployeeSchedulesController);
UseGuards(JwtAuthGuard)(EmployeeSchedulesController);

module.exports = { EmployeeSchedulesController };
