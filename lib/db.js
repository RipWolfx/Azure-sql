import sql from 'mssql';

function assertDbEnv() {
  const required = ['AZURE_SQL_USER', 'AZURE_SQL_PASSWORD', 'AZURE_SQL_SERVER', 'AZURE_SQL_DATABASE'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`MISSING_ENV:${missing.join(',')}`);
  }
}

const config = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  port: process.env.AZURE_SQL_PORT ? parseInt(process.env.AZURE_SQL_PORT, 10) : 1433,
  connectionTimeout: 30000,
  requestTimeout: 30000,
  options: {
    encrypt: process.env.AZURE_SQL_ENCRYPT === 'false' ? false : true,
    trustServerCertificate: false
  },
  pool: {
    max: 5,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise;

export async function getPool() {
  if (!poolPromise) {
    assertDbEnv();
    poolPromise = sql.connect(config);
  }
  return poolPromise;
}

export { sql };
