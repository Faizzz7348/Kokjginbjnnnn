const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all products
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id');
        // Map snake_case to camelCase for frontend
        const products = result.rows.map(row => ({
            ...row,
            inventoryStatus: row.inventory_status,
            operatingHours: row.operating_hours,
            machineType: row.machine_type,
            paymentMethods: row.payment_methods,
            lastMaintenance: row.last_maintenance\n        }));\n        res.json(products);\n    } catch (error) {\n        console.error('Error fetching products:', error);\n        res.status(500).json({ error: 'Failed to fetch products' });\n    }\n});

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
            lastMaintenance: result.rows[0].last_maintenance\n        };\n        res.json(product);\n    } catch (error) {\n        console.error('Error fetching product:', error);\n        res.status(500).json({ error: 'Failed to fetch product' });\n    }\n});

// POST create product
router.post('/', async (req, res) => {
    try {\n        const { code, name, description, image, price, category, quantity, inventoryStatus, rating, shift, \n                location, latitude, longitude, address, operatingHours, machineType, paymentMethods, \n                lastMaintenance, status } = req.body;\n        \n        const result = await pool.query(\n            `INSERT INTO products (code, name, description, image, price, category, quantity, inventory_status, \n             rating, shift, location, latitude, longitude, address, operating_hours, machine_type, \n             payment_methods, last_maintenance, status) \n             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,\n            [code, name, description, image, price, category, quantity, inventoryStatus, rating, shift,\n             location, latitude, longitude, address, operatingHours, machineType, paymentMethods, \n             lastMaintenance, status]\n        );\n        \n        const product = {\n            ...result.rows[0],\n            inventoryStatus: result.rows[0].inventory_status,\n            operatingHours: result.rows[0].operating_hours,\n            machineType: result.rows[0].machine_type,\n            paymentMethods: result.rows[0].payment_methods,\n            lastMaintenance: result.rows[0].last_maintenance\n        };\n        res.status(201).json(product);\n    } catch (error) {\n        console.error('Error creating product:', error);\n        res.status(500).json({ error: 'Failed to create product' });\n    }\n});

// PUT update product
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, description, image, price, category, quantity, inventoryStatus, rating, shift,\n                location, latitude, longitude, address, operatingHours, machineType, paymentMethods, \n                lastMaintenance, status } = req.body;
        \n        const result = await pool.query(\n            `UPDATE products \n             SET code = $1, name = $2, description = $3, image = $4, price = $5, \n                 category = $6, quantity = $7, inventory_status = $8, rating = $9, shift = $10,\n                 location = $11, latitude = $12, longitude = $13, address = $14, operating_hours = $15,\n                 machine_type = $16, payment_methods = $17, last_maintenance = $18, status = $19\n             WHERE id = $20 RETURNING *`,\n            [code, name, description, image, price, category, quantity, inventoryStatus, rating, shift,\n             location, latitude, longitude, address, operatingHours, machineType, paymentMethods, \n             lastMaintenance, status, id]\n        );\n        \n        if (result.rows.length === 0) {\n            return res.status(404).json({ error: 'Product not found' });\n        }\n        \n        const product = {\n            ...result.rows[0],\n            inventoryStatus: result.rows[0].inventory_status,\n            operatingHours: result.rows[0].operating_hours,\n            machineType: result.rows[0].machine_type,\n            paymentMethods: result.rows[0].payment_methods,\n            lastMaintenance: result.rows[0].last_maintenance\n        };\n        res.json(product);\n    } catch (error) {\n        console.error('Error updating product:', error);\n        res.status(500).json({ error: 'Failed to update product' });\n    }\n});

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
