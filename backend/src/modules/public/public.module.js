const { Module } = require('@nestjs/common');
const { DbModule } = require('../db/db.module');
const { EmailModule } = require('../email/email.module');
const { PublicController } = require('./public.controller');
const { PublicService } = require('./public.service');
const { PublicRepository } = require('./public.repository');

class PublicModule {}

Module({
  imports: [DbModule, EmailModule],
  controllers: [PublicController],
  providers: [PublicService, PublicRepository],
})(PublicModule);

module.exports = { PublicModule };
