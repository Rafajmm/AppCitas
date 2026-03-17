const { Controller, Get, Put, Param, Query, Body, UseGuards, Req, BadRequestException, Inject } = require('@nestjs/common');
const { JwtAuthGuard } = require('../auth/jwt-auth.guard');
const { BusinessSchedulesService } = require('./business-schedules.service');
const { businessSchemas } = require('./business-schedules.schemas');

class BusinessSchedulesController {
  constructor(businessSchedulesService) {
    this.businessSchedulesService = businessSchedulesService;
  }

  async getBusinessSchedules(query, req) {
    const { negocio_id } = query;
    return await this.businessSchedulesService.getBusinessSchedules(req.user.adminId, negocio_id);
  }

  async updateBusinessSchedules(params, body, req) {
    const { negocioId } = params;
    
    // Validate request body
    const { value, error } = businessSchemas.updateBusinessSchedules.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));
    
    const { schedules } = value;
    return await this.businessSchedulesService.updateBusinessSchedules(req.user.adminId, negocioId, schedules);
  }
}

// Add decorators following the app pattern
Inject(BusinessSchedulesService)(BusinessSchedulesController, undefined, 0);

Get('')(BusinessSchedulesController.prototype, 'getBusinessSchedules', Object.getOwnPropertyDescriptor(BusinessSchedulesController.prototype, 'getBusinessSchedules'));
Query()(BusinessSchedulesController.prototype, 'getBusinessSchedules', 0);
Req()(BusinessSchedulesController.prototype, 'getBusinessSchedules', 1);
UseGuards(JwtAuthGuard)(BusinessSchedulesController.prototype, 'getBusinessSchedules', Object.getOwnPropertyDescriptor(BusinessSchedulesController.prototype, 'getBusinessSchedules'));

Put(':negocioId')(BusinessSchedulesController.prototype, 'updateBusinessSchedules', Object.getOwnPropertyDescriptor(BusinessSchedulesController.prototype, 'updateBusinessSchedules'));
Param('negocioId')(BusinessSchedulesController.prototype, 'updateBusinessSchedules', 0);
Body()(BusinessSchedulesController.prototype, 'updateBusinessSchedules', 1);
Req()(BusinessSchedulesController.prototype, 'updateBusinessSchedules', 2);
UseGuards(JwtAuthGuard)(BusinessSchedulesController.prototype, 'updateBusinessSchedules', Object.getOwnPropertyDescriptor(BusinessSchedulesController.prototype, 'updateBusinessSchedules'));

Controller('admin/business-schedules')(BusinessSchedulesController);
UseGuards(JwtAuthGuard)(BusinessSchedulesController);

module.exports = { BusinessSchedulesController };
