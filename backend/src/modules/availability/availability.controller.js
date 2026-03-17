const { Controller, Get, Req, Inject, BadRequestException } = require('@nestjs/common');
const { AvailabilityService } = require('./availability.service');
const { getSlotsQuerySchema } = require('./availability.schemas');

class AvailabilityController {
  constructor(availabilityService) {
    this.availabilityService = availabilityService;
  }

  async getSlots(req) {
    const slug = req.params.slug;
    const query = req.query;

    const { value, error } = getSlotsQuerySchema.validate(query, { abortEarly: false, stripUnknown: true });
    if (error) {
      throw new BadRequestException(error.details.map((d) => d.message));
    }

    const serviceIds = value.serviceIds.split(',').map((s) => s.trim()).filter(Boolean);
    if (serviceIds.length === 0) {
      throw new BadRequestException(['serviceIds must include at least one UUID']);
    }

    return await this.availabilityService.getSlots({
      slug,
      date: value.date,
      serviceIds,
      employeeId: value.employeeId,
      slotMinutes: value.slotMinutes,
    });
  }
}

Controller('public/:slug/availability')(AvailabilityController);
// Inject AvailabilityService into first constructor param
Inject(AvailabilityService)(AvailabilityController, undefined, 0);
Get('slots')(
  AvailabilityController.prototype,
  'getSlots',
  Object.getOwnPropertyDescriptor(AvailabilityController.prototype, 'getSlots'),
);
Req()(AvailabilityController.prototype, 'getSlots', 0);

module.exports = { AvailabilityController };
