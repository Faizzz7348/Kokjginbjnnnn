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
            inventoryStatus: row.inventory_status
        }));
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
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
            inventoryStatus: result.rows[0].inventory_status
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
        const { code, name, description, image, price, category, quantity, inventoryStatus, rating, shift } = req.body;
        
        const result = await pool.query(
            `INSERT INTO products (code, name, description, image, price, category, quantity, inventory_status, rating, shift) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [code, name, description, image, price, category, quantity, inventoryStatus, rating, shift]
        );
        
        const product = {
            ...result.rows[0],
            inventoryStatus: result.rows[0].inventory_status
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
        const { code, name, description, image, price, category, quantity, inventoryStatus, rating, shift } = req.body;
        
        const result = await pool.query(
            `UPDATE products 
             SET code = $1, name = $2, description = $3, image = $4, price = $5, 
                 category = $6, quantity = $7, inventory_status = $8, rating = $9, shift = $10
             WHERE id = $11 RETURNING *`,
            [code, name, description, image, price, category, quantity, inventoryStatus, rating, shift, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const product = {
            ...result.rows[0],
            inventoryStatus: result.rows[0].inventory_status
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
