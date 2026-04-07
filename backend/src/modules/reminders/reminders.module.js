const { Module } = require('@nestjs/common');
const { DbModule } = require('../db/db.module');
const { EmailModule } = require('../email/email.module');
const { RemindersService } = require('./reminders.service');
const { RemindersRepository } = require('./reminders.repository');

class RemindersModule {}

Module({
  imports: [DbModule, EmailModule],
  providers: [RemindersService, RemindersRepository],
})(RemindersModule);

module.exports = { RemindersModule };
