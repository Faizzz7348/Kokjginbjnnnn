const pool = require('./db');

async function checkFlexData() {
    try {
        console.log('🔍 Checking flex table data...\n');

        // Get parent products
        const parentResult = await pool.query(`
            SELECT id, code, name 
            FROM products 
            WHERE parent_id IS NULL 
            ORDER BY id
        `);
        
        console.log(`📦 Found ${parentResult.rows.length} parent products:\n`);

        for (const parent of parentResult.rows) {
            // Get flex rows for this parent
            const flexResult = await pool.query(`
                SELECT id, code, location, inventory_status, power_mode
                FROM products 
                WHERE parent_id = $1 
                ORDER BY code
            `, [parent.id]);

            console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📍 Parent: ${parent.code} - ${parent.name}`);
            console.log(`   Flex Rows: ${flexResult.rows.length}`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

            if (flexResult.rows.length > 0) {
                flexResult.rows.forEach((row, idx) => {
                    const powerIcon = row.power_mode === 'on' ? '🟢' : 
                                    row.power_mode === 'off' ? '🔴' : '⚪';
                    const statusIcon = row.inventory_status === 'AM' ? '🌅' : '🌙';
                    console.log(`   ${idx + 1}. ${row.code} - ${row.location}`);
                    console.log(`      ${statusIcon} ${row.inventory_status}  ${powerIcon} Power: ${row.power_mode || 'Not Set'}`);
                });
            } else {
                console.log('   ⚠️  No flex rows found for this parent');
            }
        }

        // Total stats
        const totalFlexRows = await pool.query(`
            SELECT COUNT(*) as count 
            FROM products 
            WHERE parent_id IS NOT NULL
        `);

        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`📊 TOTAL FLEX TABLE ROWS: ${totalFlexRows.rows[0].count}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking flex data:', error);
        process.exit(1);
    }
}

checkFlexData();

module.exports = { checkFlexData };
