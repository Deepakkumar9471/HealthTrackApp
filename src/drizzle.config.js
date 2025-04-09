/** @type { import("drizzle-kit").Config } */
module.exports = {
    schema: "./src/shared/schema.js",
    out: "./drizzle",
    dialect: 'postgresql',
    dbCredentials: {
      connectionString: process.env.DATABASE_URL,
    },
  };