const { Injectable, ForbiddenException } = require('@nestjs/common');

class AdminGuard {
  canActivate(context) {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user || user.rol !== 'admin') {
      throw new ForbiddenException('Access denied. Admin role required.');
    }

    return true;
  }
}

Injectable()(AdminGuard);

module.exports = { AdminGuard };
