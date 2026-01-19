const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all customers
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM customers ORDER BY id');
        
        // Format data to match frontend structure
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

// GET single customer
router.get('/:id', async (req, res) => {
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

// POST create customer
router.post('/', async (req, res) => {
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
        
        res.status(201).json(customer);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Failed to create customer' });
    }
});

// PUT update customer
router.put('/:id', async (req, res) => {
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
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Failed to update customer' });
    }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
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

module.exports = router;
