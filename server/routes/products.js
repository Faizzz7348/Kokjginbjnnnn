const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all products
router.get('/', async (req, res) => {
    try {
        // Only get main table products (parent_id IS NULL)
        const result = await pool.query('SELECT * FROM products WHERE parent_id IS NULL ORDER BY id');
        // Map snake_case to camelCase for frontend
        const products = result.rows.map(row => ({
            ...row,
            inventoryStatus: row.inventory_status,
            operatingHours: row.operating_hours,
            machineType: row.machine_type,
            paymentMethods: row.payment_methods,
            lastMaintenance: row.last_maintenance,
            parentId: row.parent_id
        }));
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET products by parent ID (flex table items)
router.get('/parent/:parentId', async (req, res) => {
    try {
        const { parentId } = req.params;
        const result = await pool.query('SELECT * FROM products WHERE parent_id = $1 ORDER BY id', [parentId]);
        const products = result.rows.map(row => ({
            ...row,
            inventoryStatus: row.inventory_status,
            operatingHours: row.operating_hours,
            machineType: row.machine_type,
            paymentMethods: row.payment_methods,
            lastMaintenance: row.last_maintenance,
            parentId: row.parent_id
        }));
        res.json(products);
    } catch (error) {
        console.error('Error fetching flex products:', error);
        res.status(500).json({ error: 'Failed to fetch flex products' });
    }
});

// GET single product
router.get('/:id', async (req, res) => {
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
            lastMaintenance: result.rows[0].last_maintenance,
            parentId: result.rows[0].parent_id
        };
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// POST create product
router.post('/', async (req, res) => {
    try {
        let { code, name, description, image, price, category, quantity, inventoryStatus, rating, shift, 
                location, latitude, longitude, address, operatingHours, machineType, paymentMethods, 
                lastMaintenance, status, parentId } = req.body;
        
        // Auto-generate name if empty
        if (!name || name.trim() === '') {
            name = `Product-${Date.now()}`;
        }
        
        const result = await pool.query(
            `INSERT INTO products (code, name, description, image, price, category, quantity, inventory_status, 
             rating, shift, location, latitude, longitude, address, operating_hours, machine_type, 
             payment_methods, last_maintenance, status, parent_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING *`,
            [code, name, description, image, price, category, quantity, inventoryStatus, rating, shift,
             location, latitude, longitude, address, operatingHours, machineType, paymentMethods, 
             lastMaintenance, status, parentId]
        );
        
        const product = {
            ...result.rows[0],
            inventoryStatus: result.rows[0].inventory_status,
            operatingHours: result.rows[0].operating_hours,
            machineType: result.rows[0].machine_type,
            paymentMethods: result.rows[0].payment_methods,
            lastMaintenance: result.rows[0].last_maintenance,
            parentId: result.rows[0].parent_id
        };
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// PUT update product
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let { code, name, description, image, price, category, quantity, inventoryStatus, rating, shift,
                location, latitude, longitude, address, operatingHours, machineType, paymentMethods, 
                lastMaintenance, status, parentId } = req.body;
        
        // Auto-generate name if empty
        if (!name || name.trim() === '') {
            name = `Product-${id}-${Date.now()}`;
        }
        
        const result = await pool.query(
            `UPDATE products 
             SET code = $1, name = $2, description = $3, image = $4, price = $5, 
                 category = $6, quantity = $7, inventory_status = $8, rating = $9, shift = $10,
                 location = $11, latitude = $12, longitude = $13, address = $14, operating_hours = $15,
                 machine_type = $16, payment_methods = $17, last_maintenance = $18, status = $19, parent_id = $20
             WHERE id = $21 RETURNING *`,
            [code, name, description, image, price, category, quantity, inventoryStatus, rating, shift,
             location, latitude, longitude, address, operatingHours, machineType, paymentMethods, 
             lastMaintenance, status, req.body.parentId || null, id]
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
            lastMaintenance: result.rows[0].last_maintenance,
            parentId: result.rows[0].parent_id
        };
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// DELETE product
router.delete('/:id', async (req, res) => {
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

module.exports = router;
