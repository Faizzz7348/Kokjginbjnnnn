const pool = require('./db');

async function initDatabase() {
    try {
        // Create customers table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS customers (
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
        console.log('✓ Customers table created');

        // Create products table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Products table created');

        // Check if tables have data
        const customerCount = await pool.query('SELECT COUNT(*) FROM customers');
        const productCount = await pool.query('SELECT COUNT(*) FROM products');

        if (customerCount.rows[0].count === '0') {
            console.log('📝 Inserting sample customer data...');
            await insertSampleCustomers();
        }

        if (productCount.rows[0].count === '0') {
            console.log('📝 Inserting sample product data...');
            await insertSampleProducts();
        }

        console.log('✅ Database initialization complete!');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
}

async function insertSampleCustomers() {
    const customers = [
        { name: 'James Butt', country_name: 'Algeria', country_code: 'dz', company: 'Benton, John B Jr', representative_name: 'Ioni Bowcher', representative_image: 'ionibowcher.png' },
        { name: 'Josephine Darakjy', country_name: 'Egypt', country_code: 'eg', company: 'Chanay, Jeffrey A Esq', representative_name: 'Amy Elsner', representative_image: 'amyelsner.png' },
        { name: 'Art Venere', country_name: 'Panama', country_code: 'pa', company: 'Chemel, James L Cpa', representative_name: 'Asiya Javayant', representative_image: 'asiyajavayant.png' },
        { name: 'Lenna Paprocki', country_name: 'Slovenia', country_code: 'si', company: 'Feltz Printing Service', representative_name: 'Xuxue Feng', representative_image: 'xuxuefeng.png' },
        { name: 'Donette Foller', country_name: 'South Africa', country_code: 'za', company: 'Printing Dimensions', representative_name: 'Asiya Javayant', representative_image: 'asiyajavayant.png' }
    ];

    for (const customer of customers) {
        await pool.query(
            `INSERT INTO customers (name, country_name, country_code, company, representative_name, representative_image) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [customer.name, customer.country_name, customer.country_code, customer.company, customer.representative_name, customer.representative_image]
        );
    }
    console.log('✓ Sample customers inserted');
}

async function insertSampleProducts() {
    const products = [
        { code: 'f230fh0g3', name: 'Bamboo Watch', description: 'Product Description', image: 'bamboo-watch.jpg', price: 65, category: 'Accessories', quantity: 24, inventory_status: 'INSTOCK', rating: 5 },
        { code: 'nvklal433', name: 'Black Watch', description: 'Product Description', image: 'black-watch.jpg', price: 72, category: 'Accessories', quantity: 61, inventory_status: 'INSTOCK', rating: 4 },
        { code: 'zz21cz3c1', name: 'Blue Band', description: 'Product Description', image: 'blue-band.jpg', price: 79, category: 'Fitness', quantity: 2, inventory_status: 'LOWSTOCK', rating: 3 },
        { code: '244wgerg2', name: 'Blue T-Shirt', description: 'Product Description', image: 'blue-t-shirt.jpg', price: 29, category: 'Clothing', quantity: 25, inventory_status: 'INSTOCK', rating: 5 },
        { code: 'h456wer53', name: 'Bracelet', description: 'Product Description', image: 'bracelet.jpg', price: 15, category: 'Accessories', quantity: 73, inventory_status: 'INSTOCK', rating: 4 }
    ];

    for (const product of products) {
        await pool.query(
            `INSERT INTO products (code, name, description, image, price, category, quantity, inventory_status, rating) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [product.code, product.name, product.description, product.image, product.price, product.category, product.quantity, product.inventory_status, product.rating]
        );
    }
    console.log('✓ Sample products inserted');
}

// Run initialization
initDatabase();

module.exports = { initDatabase };
