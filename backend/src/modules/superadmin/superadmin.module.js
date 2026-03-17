const { Module } = require('@nestjs/common');
const { DbModule } = require('../db/db.module');
const { SuperadminController } = require('./superadmin.controller');
const { SuperadminService } = require('./superadmin.service');
const { SuperadminRepository } = require('./superadmin.repository');
const { SuperadminGuard } = require('./superadmin.guard');

class SuperadminModule {}

Module({
  imports: [DbModule],
  controllers: [SuperadminController],
  providers: [
    SuperadminService,
    SuperadminRepository,
    SuperadminGuard,
  ],
})(SuperadminModule);

module.exports = { SuperadminModule };
