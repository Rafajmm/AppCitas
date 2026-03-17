const { Injectable, UnauthorizedException } = require('@nestjs/common');
const { verifyToken } = require('./jwt');

class JwtAuthGuard {
  canActivate(context) {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] || '';
    const m = String(auth).match(/^Bearer\s+(.+)$/i);
    if (!m) throw new UnauthorizedException('Missing bearer token');

    try {
      const payload = verifyToken(m[1]);
      req.user = payload;
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

Injectable()(JwtAuthGuard);

module.exports = { JwtAuthGuard };
