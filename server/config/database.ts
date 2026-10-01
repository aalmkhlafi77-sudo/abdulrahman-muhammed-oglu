import mysql from 'mysql2/promise';

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const db = mysql.createPool({
  host: requiredEnv('DB_HOST'),
  port: Number(requiredEnv('DB_PORT')),
  database: requiredEnv('DB_NAME'),
  user: requiredEnv('DB_USER'),
  password: requiredEnv('DB_PASSWORD'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;
