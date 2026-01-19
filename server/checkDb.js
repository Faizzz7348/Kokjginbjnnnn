const pool = require('./db');

async function checkDatabase() {
    console.log('🔍 Checking database...\n');
    
    try {
        // Check connection
        const connResult = await pool.query('SELECT NOW()');
        console.log('✅ Database connected:', connResult.rows[0].now);
        
        // Check products table exists
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'products'
            );
        `);
        console.log('✅ Products table exists:', tableCheck.rows[0].exists);
        
        // Count products
        const countResult = await pool.query('SELECT COUNT(*) FROM products');
        console.log('📊 Products count:', countResult.rows[0].count);
        
        // Get all products
        if (countResult.rows[0].count > 0) {
            const products = await pool.query('SELECT id, code, name, price, inventory_status FROM products ORDER BY id LIMIT 5');
            console.log('\n📦 Sample products:');
            products.rows.forEach(p => {
                console.log(`  - [${p.id}] ${p.code}: ${p.name} - $${p.price} (${p.inventory_status})`);
            });
        } else {
            console.log('\n⚠️  Database is EMPTY! No products found.');
            console.log('   Run: npm run init-db');
        }
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
    }
    
    process.exit(0);
}

checkDatabase();
