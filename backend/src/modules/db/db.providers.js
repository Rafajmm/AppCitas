const { Pool } = require('pg');

const DB_POOL = Symbol('DB_POOL');

const DbPoolProvider = {
  provide: DB_POOL,
  useFactory: () => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required');
    }

    return new Pool({ connectionString });
  },
};

module.exports = { DB_POOL, DbPoolProvider };
