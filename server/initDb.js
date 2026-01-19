const pool = require('./db');

async function initDatabase() {
    try {
        // DROP existing tables to clear ALL old data
        console.log('🗑️  Deleting old tables...');
        await pool.query('DROP TABLE IF EXISTS customers CASCADE');
        await pool.query('DROP TABLE IF EXISTS products CASCADE');
        console.log('✓ Old data deleted');

        // Create customers table
        await pool.query(`
            CREATE TABLE customers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                country_name VARCHAR(255),
                country_code VARCHAR(2),
                company VARCHAR(255),
                representative_name VARCHAR(255),
                representative_image VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Customers table created (fresh)');

        // Create products table
        await pool.query(`
            CREATE TABLE products (
                id SERIAL PRIMARY KEY,
                code VARCHAR(100) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                image VARCHAR(255),
                price DECIMAL(10, 2),
                category VARCHAR(100),
                quantity INTEGER DEFAULT 0,
                inventory_status VARCHAR(50),
                rating INTEGER,
                shift VARCHAR(50),
                location VARCHAR(500),
                latitude VARCHAR(50),
                longitude VARCHAR(50),
                address TEXT,
                operating_hours VARCHAR(255),
                machine_type VARCHAR(255),
                payment_methods VARCHAR(255),
                last_maintenance VARCHAR(255),
                status VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Products table created (fresh)');

        console.log('✅ Database initialization complete! (No sample data inserted)');
        console.log('📋 Tables are empty and ready for your data');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        process.exit(1);
    }
}

// Run initialization
initDatabase();

module.exports = { initDatabase };
