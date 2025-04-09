/**
 * Database configuration and connection
 */
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');

// Create a PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Create Drizzle ORM instance
const db = drizzle(pool);

module.exports = {
  db,
  pool
};
