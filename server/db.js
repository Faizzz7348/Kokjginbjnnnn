const { Pool } = require('pg');
require('dotenv').config();

// Parse the connection string and add explicit SSL mode
const connectionString = process.env.DATABASE_URL;
const connectionConfig = connectionString.includes('?') 
    ? `${connectionString}&sslmode=verify-full`
    : `${connectionString}?sslmode=verify-full`;

const pool = new Pool({
    connectionString: connectionConfig,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('✓ Database connected successfully at', res.rows[0].now);
    }
});

module.exports = pool;
