const { Module } = require('@nestjs/common');
const { DbPoolProvider } = require('./db.providers');

class DbModule {}

Module({
  providers: [DbPoolProvider],
  exports: [DbPoolProvider],
})(DbModule);

module.exports = { DbModule };
