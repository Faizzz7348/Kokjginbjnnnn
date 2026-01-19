const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API is running' });
});

// Customer Routes
app.get('/api/customers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM customers ORDER BY id');
        const customers = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            country: {
                name: row.country_name,
                code: row.country_code
            },
            company: row.company,
            representative: {
                name: row.representative_name,
                image: row.representative_image
            }
        }));
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

app.get('/api/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        const row = result.rows[0];
        const customer = {
            id: row.id,
            name: row.name,
            country: {
                name: row.country_name,
                code: row.country_code
            },
            company: row.company,
            representative: {
                name: row.representative_name,
                image: row.representative_image
            }
        };
        res.json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
});

app.post('/api/customers', async (req, res) => {
    try {
        const { name, country, company, representative } = req.body;
        const result = await pool.query(
            `INSERT INTO customers (name, country_name, country_code, company, representative_name, representative_image) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, country?.name, country?.code, company, representative?.name, representative?.image]
        );
        
        const row = result.rows[0];
        const customer = {
            id: row.id,
            name: row.name,
            country: { name: row.country_name, code: row.country_code },
            company: row.company,
            representative: { name: row.representative_name, image: row.representative_image }
        };
        res.status(201).json(customer);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Failed to create customer' });
    }
});

app.put('/api/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, country, company, representative } = req.body;
        const result = await pool.query(
            `UPDATE customers 
             SET name = $1, country_name = $2, country_code = $3, company = $4, 
                 representative_name = $5, representative_image = $6
             WHERE id = $7 RETURNING *`,
            [name, country?.name, country?.code, company, representative?.name, representative?.image, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        const row = result.rows[0];
        const customer = {
            id: row.id,
            name: row.name,
            country: { name: row.country_name, code: row.country_code },
            company: row.company,
            representative: { name: row.representative_name, image: row.representative_image }
        };
        res.json(customer);
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Failed to update customer' });
    }
});

app.delete('/api/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ error: 'Failed to delete customer' });
    }
});

// Product Routes
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id');
        // Map snake_case to camelCase for frontend
        const products = result.rows.map(row => ({
            ...row,
            inventoryStatus: row.inventory_status,
            operatingHours: row.operating_hours,
            machineType: row.machine_type,
            paymentMethods: row.payment_methods,
            lastMaintenance: row.last_maintenance
        }));
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const product = {
            ...result.rows[0],
            inventoryStatus: result.rows[0].inventory_status,
            operatingHours: result.rows[0].operating_hours,
            machineType: result.rows[0].machine_type,
            paymentMethods: result.rows[0].payment_methods,
            lastMaintenance: result.rows[0].last_maintenance
        };
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { code, name, description, image, price, category, quantity, inventoryStatus, rating, shift,
                location, latitude, longitude, address, operatingHours, machineType, paymentMethods,
                lastMaintenance, status } = req.body;
        
        // Handle null/undefined values for integer fields
        const safeRating = (rating === undefined || rating === null || !isFinite(rating)) ? null : rating;
        const safeQuantity = (quantity === undefined || quantity === null || !isFinite(quantity)) ? 0 : quantity;
        const safePrice = (price === undefined || price === null || !isFinite(price)) ? 0 : price;
        
        const result = await pool.query(
            `INSERT INTO products (code, name, description, image, price, category, quantity, inventory_status, 
             rating, shift, location, latitude, longitude, address, operating_hours, machine_type, 
             payment_methods, last_maintenance, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
            [code, name, description, image, safePrice, category, safeQuantity, inventoryStatus, safeRating, shift,
             location, latitude, longitude, address, operatingHours, machineType, paymentMethods,
             lastMaintenance, status]
        );
        
        const product = {
            ...result.rows[0],
            inventoryStatus: result.rows[0].inventory_status,
            operatingHours: result.rows[0].operating_hours,
            machineType: result.rows[0].machine_type,
            paymentMethods: result.rows[0].payment_methods,
            lastMaintenance: result.rows[0].last_maintenance
        };
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, description, image, price, category, quantity, inventoryStatus, rating, shift,
                location, latitude, longitude, address, operatingHours, machineType, paymentMethods,
                lastMaintenance, status } = req.body;
        
        // Handle null/undefined values for integer fields to prevent -Infinity error
        const safeRating = (rating === undefined || rating === null || !isFinite(rating)) ? null : rating;
        const safeQuantity = (quantity === undefined || quantity === null || !isFinite(quantity)) ? 0 : quantity;
        const safePrice = (price === undefined || price === null || !isFinite(price)) ? 0 : price;
        
        const result = await pool.query(
            `UPDATE products 
             SET code = $1, name = $2, description = $3, image = $4, price = $5, 
                 category = $6, quantity = $7, inventory_status = $8, rating = $9, shift = $10,
                 location = $11, latitude = $12, longitude = $13, address = $14, operating_hours = $15,
                 machine_type = $16, payment_methods = $17, last_maintenance = $18, status = $19
             WHERE id = $20 RETURNING *`,
            [code, name, description, image, safePrice, category, safeQuantity, inventoryStatus, safeRating, shift,
             location, latitude, longitude, address, operatingHours, machineType, paymentMethods,
             lastMaintenance, status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const product = {
            ...result.rows[0],
            inventoryStatus: result.rows[0].inventory_status,
            operatingHours: result.rows[0].operating_hours,
            machineType: result.rows[0].machine_type,
            paymentMethods: result.rows[0].payment_methods,
            lastMaintenance: result.rows[0].last_maintenance
        };
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

module.exports = app;
