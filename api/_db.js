const mysql = require('mysql2/promise');

const required = ['DB_HOST', 'DB_USER', 'DB_DATABASE'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONN_LIMIT || '5', 10),
  // Optional SSL for managed providers (e.g., PlanetScale)
  ssl: (process.env.DB_SSL || 'false').toLowerCase() === 'true' ? { rejectUnauthorized: true } : undefined,
});

async function ensureTables() {
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS lost_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_name VARCHAR(255) NOT NULL,
      color VARCHAR(100) NOT NULL,
      location VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS found_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_name VARCHAR(255) NOT NULL,
      color VARCHAR(100) NOT NULL,
      location VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      finder_contact VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const conn = await pool.getConnection();
  try {
    await conn.query(createTablesSQL);
  } finally {
    conn.release();
  }
}

let tablesEnsured = false;
async function init() {
  if (!tablesEnsured) {
    await ensureTables();
    tablesEnsured = true;
  }
}

module.exports = { pool, init };