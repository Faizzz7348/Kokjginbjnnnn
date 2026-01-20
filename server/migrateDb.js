const pool = require('./db');

async function migrateDatabase() {
    try {
        console.log('🔄 Migrating database schema...');

        // Check if power_mode column exists
        const powerModeCheck = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='products' AND column_name='power_mode'
        `);

        if (powerModeCheck.rows.length === 0) {
            console.log('➕ Adding power_mode column...');
            await pool.query(`
                ALTER TABLE products 
                ADD COLUMN power_mode VARCHAR(10)
            `);
            console.log('✅ power_mode column added');
        } else {
            console.log('✓ power_mode column already exists');
        }

        // Check if images column exists
        const imagesCheck = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='products' AND column_name='images'
        `);

        if (imagesCheck.rows.length === 0) {
            console.log('➕ Adding images column...');
            await pool.query(`
                ALTER TABLE products 
                ADD COLUMN images JSONB
            `);
            console.log('✅ images column added');
        } else {
            console.log('✓ images column already exists');
        }

        console.log('\n✅ Database migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
}

// Run migration
migrateDatabase();

module.exports = { migrateDatabase };
