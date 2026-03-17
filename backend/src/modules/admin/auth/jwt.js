const jwt = require('jsonwebtoken');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev_secret_change_me';
}

function signAdminToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = { signAdminToken, verifyToken };
