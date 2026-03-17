const { Controller, Post, Req, Inject, BadRequestException } = require('@nestjs/common');
const { AdminAuthService } = require('./admin-auth.service');
const { loginSchema } = require('./admin-auth.schemas');

class AdminAuthController {
  constructor(service) {
    this.service = service;
  }

  async login(req) {
    const { value, error } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.service.login(value.email, value.password);
  }
}

Controller('admin/auth')(AdminAuthController);
Inject(AdminAuthService)(AdminAuthController, undefined, 0);

Post('login')(AdminAuthController.prototype, 'login', Object.getOwnPropertyDescriptor(AdminAuthController.prototype, 'login'));
Req()(AdminAuthController.prototype, 'login', 0);

module.exports = { AdminAuthController };
