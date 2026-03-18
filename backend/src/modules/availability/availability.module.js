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
  exports: [AvailabilityService], // Exportar AvailabilityService para que otros módulos puedan usarlo
})(AvailabilityModule);

module.exports = { AvailabilityModule };
