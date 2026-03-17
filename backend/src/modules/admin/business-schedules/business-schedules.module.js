const { BusinessSchedulesController } = require('./business-schedules.controller');
const { BusinessSchedulesService } = require('./business-schedules.service');
const { BusinessSchedulesRepository } = require('./business-schedules.repository');
const { Module, Inject } = require('@nestjs/common');

class BusinessSchedulesModule {}

Module({
  controllers: [BusinessSchedulesController],
  providers: [
    BusinessSchedulesService,
    BusinessSchedulesRepository,
  ],
  exports: [BusinessSchedulesService],
})(BusinessSchedulesModule);

// Inject dependencies
Inject()(BusinessSchedulesRepository, undefined, 0);
Inject(BusinessSchedulesRepository)(BusinessSchedulesService, undefined, 0);

module.exports = { BusinessSchedulesModule };
