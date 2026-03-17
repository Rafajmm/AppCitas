const { EmployeeSchedulesController } = require('./employee-schedules.controller');
const { EmployeeSchedulesService } = require('./employee-schedules.service');
const { EmployeeSchedulesRepository } = require('./employee-schedules.repository');
const { Module, Inject } = require('@nestjs/common');

class EmployeeSchedulesModule {}

Module({
  controllers: [EmployeeSchedulesController],
  providers: [
    EmployeeSchedulesService,
    EmployeeSchedulesRepository,
  ],
  exports: [EmployeeSchedulesService],
})(EmployeeSchedulesModule);

// Inject dependencies
Inject()(EmployeeSchedulesRepository, undefined, 0);
Inject(EmployeeSchedulesRepository)(EmployeeSchedulesService, undefined, 0);

module.exports = { EmployeeSchedulesModule };
