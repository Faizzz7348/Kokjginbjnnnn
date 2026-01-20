const pool = require('./db');

async function seedFlexTableData() {
    try {
        console.log('🌱 Seeding flex table sample data...');

        // Get the first 3 parent products
        const parentResult = await pool.query('SELECT id, code, name FROM products WHERE parent_id IS NULL ORDER BY id LIMIT 3');
        const parents = parentResult.rows;

        if (parents.length === 0) {
            console.log('⚠️  No parent products found. Please add some main products first.');
            process.exit(0);
        }

        console.log(`📦 Found ${parents.length} parent products, adding flex table rows...`);

        // Sample locations for flex table
        const sampleLocations = [
            { 
                code: 'VM-001', 
                location: 'Lobby Area - Main Building',
                latitude: '3.1390',
                longitude: '101.6869',
                address: 'Ground Floor, Main Lobby, KL Tower',
                status: 'AM'
            },
            { 
                code: 'VM-002', 
                location: 'Cafeteria - Level 2',
                latitude: '3.1395',
                longitude: '101.6875',
                address: 'Level 2, Cafeteria Wing, KL Tower',
                status: 'PM'
            },
            { 
                code: 'VM-003', 
                location: 'Office Block A - Entrance',
                latitude: '3.1385',
                longitude: '101.6880',
                address: 'Block A, Main Entrance, KL Tower',
                status: 'AM'
            },
            { 
                code: 'VM-004', 
                location: 'Parking Level B1',
                latitude: '3.1380',
                longitude: '101.6865',
                address: 'Basement Level 1, Parking Area, KL Tower',
                status: 'PM'
            },
            { 
                code: 'VM-005', 
                location: 'Gym & Fitness Center',
                latitude: '3.1400',
                longitude: '101.6870',
                address: 'Level 3, Fitness Center, KL Tower',
                status: 'AM'
            },
            { 
                code: 'VM-006', 
                location: 'Conference Room Floor',
                latitude: '3.1392',
                longitude: '101.6878',
                address: 'Level 5, Conference Wing, KL Tower',
                status: 'PM'
            },
            { 
                code: 'VM-007', 
                location: 'Sky Garden - Level 10',
                latitude: '3.1388',
                longitude: '101.6872',
                address: 'Level 10, Sky Garden Area, KL Tower',
                status: 'AM'
            },
            { 
                code: 'VM-008', 
                location: 'Staff Lounge - HR Department',
                latitude: '3.1393',
                longitude: '101.6868',
                address: 'Level 4, HR Department, KL Tower',
                status: 'PM'
            }
        ];

        // Sample images for variety
        const sampleImages = [
            [
                { url: 'https://picsum.photos/400/300?random=1', caption: 'Front View' },
                { url: 'https://picsum.photos/400/300?random=2', caption: 'Machine Display' }
            ],
            [
                { url: 'https://picsum.photos/400/300?random=3', caption: 'Location Overview' },
                { url: 'https://picsum.photos/400/300?random=4', caption: 'Product Selection' },
                { url: 'https://picsum.photos/400/300?random=5', caption: 'Payment Terminal' }
            ],
            [
                { url: 'https://picsum.photos/400/300?random=6', caption: 'Vending Machine' }
            ],
            null, // Some without images
            [
                { url: 'https://picsum.photos/400/300?random=7', caption: 'Full Setup' },
                { url: 'https://picsum.photos/400/300?random=8', caption: 'Interior View' }
            ]
        ];

        let totalAdded = 0;

        // Add flex table rows for each parent
        for (const parent of parents) {
            console.log(`\n📍 Adding flex rows for parent: ${parent.code} - ${parent.name}`);
            
            // Add 5-8 rows per parent with variety
            const numRows = Math.floor(Math.random() * 4) + 5; // 5-8 rows
            
            for (let i = 0; i < numRows && i < sampleLocations.length; i++) {
                const location = sampleLocations[i];
                const images = sampleImages[i % sampleImages.length];
                
                // Random power mode: 30% on, 30% off, 40% null
                const powerModeRandom = Math.random();
                let powerMode = null;
                if (powerModeRandom < 0.3) powerMode = 'on';
                else if (powerModeRandom < 0.6) powerMode = 'off';
                
                await pool.query(`
                    INSERT INTO products (
                        code, name, location, inventory_status, parent_id,
                        latitude, longitude, address, 
                        operating_hours, machine_type, payment_methods, 
                        last_maintenance, status, images, power_mode
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                `, [
                    location.code,
                    `Vending Point ${location.code}`,
                    location.location,
                    location.status,
                    parent.id,
                    location.latitude,
                    location.longitude,
                    location.address,
                    '24/7 Access Available',
                    'Snack & Beverage Combo',
                    'Cash, Card, E-Wallet, QR Code',
                    `${Math.floor(Math.random() * 10) + 1} days ago`,
                    'Active & Operational',
                    images ? JSON.stringify(images) : null,
                    powerMode
                ]);
                
                totalAdded++;
            }
            
            console.log(`✅ Added ${numRows} flex rows for ${parent.code}`);
        }

        console.log(`\n✅ Successfully added ${totalAdded} flex table sample rows!`);
        console.log('🎉 Flex table data seeding complete!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding flex table data:', error);
        process.exit(1);
    }
}

// Run seeding
seedFlexTableData();

module.exports = { seedFlexTableData };
