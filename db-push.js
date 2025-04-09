/**
 * Database migration script
 */
const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { Pool } = require('pg');
const { resolve } = require('path');
const schema = require('../src/shared/schema');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

async function main() {
  try {
    console.log('Connecting to database...');
    
    // Create a database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const db = drizzle(pool, { schema });
    
    // Print the migration plan
    console.log('Generating migration plan...');
    console.log('Migration will create/update the following tables:');
    console.log('- users');
    console.log('- activities');
    console.log('- goals');
    console.log('- notifications');
    console.log('- health_metrics');
    
    if (isDryRun) {
      console.log('Dry run completed. No changes were made to the database.');
      await pool.end();
      return;
    }
    
    console.log('Applying migrations to database...');
    
    // Apply migrations
    await migrate(db, { migrationsFolder: resolve('./drizzle') });
    
    console.log('Successfully applied migrations.');
    
    // Close the database connection
    await pool.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();