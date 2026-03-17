const { Module } = require('@nestjs/common');
const { AvailabilityModule } = require('../availability/availability.module');
const { DbModule } = require('../db/db.module');
const { PublicModule } = require('../public/public.module');
const { EmailModule } = require('../email/email.module');
const { AdminModule } = require('../admin/admin.module');
const { SuperadminModule } = require('../superadmin/superadmin.module');

class AppModule {}

Module({
  imports: [DbModule, AvailabilityModule, PublicModule, EmailModule, AdminModule, SuperadminModule],
})(AppModule);

module.exports = { AppModule };
