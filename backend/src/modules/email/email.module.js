const { Module } = require('@nestjs/common');
const { DbModule } = require('../db/db.module');
const { EmailService } = require('./email.service');
const { EmailRepository } = require('./email.repository');

class EmailModule {}

Module({
  imports: [DbModule],
  providers: [EmailService, EmailRepository],
  exports: [EmailService],
})(EmailModule);

module.exports = { EmailModule };
