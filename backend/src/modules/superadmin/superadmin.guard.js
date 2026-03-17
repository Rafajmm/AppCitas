const { Injectable, ForbiddenException, UnauthorizedException } = require('@nestjs/common');
const { verifyToken } = require('../admin/auth/jwt');

class SuperadminGuard {
  canActivate(context) {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] || '';
    const m = String(auth).match(/^Bearer\s+(.+)$/i);

    if (!m) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const payload = verifyToken(m[1]);
      req.user = payload;

      if (payload.rol !== 'superadmin') {
        throw new ForbiddenException('Access denied. Superadmin role required.');
      }

      return true;
    } catch (e) {
      if (e instanceof ForbiddenException) {
        throw e;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}

Injectable()(SuperadminGuard);

module.exports = { SuperadminGuard };
