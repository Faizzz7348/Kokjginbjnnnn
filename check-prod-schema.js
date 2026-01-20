const { Pool } = require('pg');

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false } 
});

(async () => {
    try {
        console.log('🔍 CHECKING PRODUCTION DATABASE SCHEMA...\n');
        
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'products' 
            ORDER BY ordinal_position
        `);
        
        console.log('📊 COLUMNS IN PRODUCTS TABLE:');
        result.rows.forEach(r => {
            console.log(`  - ${r.column_name}: ${r.data_type}`);
        });
        
        // Check specifically for images and power_mode
        const hasImages = result.rows.find(r => r.column_name === 'images');
        const hasPowerMode = result.rows.find(r => r.column_name === 'power_mode');
        
        console.log('\n🔎 CRITICAL COLUMNS CHECK:');
        console.log('  images column:', hasImages ? `✅ EXISTS (${hasImages.data_type})` : '❌ MISSING!!!');
        console.log('  power_mode column:', hasPowerMode ? `✅ EXISTS (${hasPowerMode.data_type})` : '❌ MISSING!!!');
        
        if (!hasImages || !hasPowerMode) {
            console.log('\n🚨🚨🚨 ROOT CAUSE FOUND 🚨🚨🚨');
            console.log('MISSING COLUMNS IN PRODUCTION DATABASE!!!');
            console.log('');
            console.log('Your API code (api/index.js) is trying to INSERT/UPDATE these columns:');
            console.log('  - images (line 251, 305)');
            console.log('  - power_mode (line 251, 308)');
            console.log('');
            console.log('But they DON\'T EXIST in your production database!');
            console.log('This is WHY all your saves are failing!');
            console.log('');
            console.log('SOLUTION: Run this SQL in your Neon console:');
            console.log('');
            console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB;');
            console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS power_mode VARCHAR(10);');
        } else {
            console.log('\n✅ All required columns exist! Problem must be elsewhere.');
        }
        
        await pool.end();
    } catch (e) {
        console.error('❌ ERROR:', e.message);
        process.exit(1);
    }
})();
