const express = require('express');
const cors = require('cors');
require('dotenv').config();

const customerRoutes = require('./routes/customers');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler untuk port already in use
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API ready at http://localhost:${PORT}/api`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Error: Port ${PORT} is already in use!`);
        console.error(`💡 Solution: Run "npm run dev:clean" to fix port conflicts`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', err);
        process.exit(1);
    }
});
