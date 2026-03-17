const { Module } = require('@nestjs/common');
const { DbModule } = require('../db/db.module');
const { AvailabilityController } = require('./availability.controller');
const { AvailabilityService } = require('./availability.service');
const { AvailabilityRepository } = require('./availability.repository');

class AvailabilityModule {}

Module({
  imports: [DbModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityService, AvailabilityRepository],
})(AvailabilityModule);

module.exports = { AvailabilityModule };
