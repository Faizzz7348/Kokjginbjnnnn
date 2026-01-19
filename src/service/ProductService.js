const API_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api'
    : 'http://localhost:3001/api';

export const ProductService = {
    async getProductsMini() {
        try {
            const response = await fetch(`${API_URL}/products`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const products = await response.json();
            
            // Add mock images and location data
            return products.map(product => ({
                ...product,
                location: 'Warehouse A',
                images: [
                    { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', caption: 'Product View 1' }
                ]
            }));
        } catch (error) {
            console.error('Error fetching products:', error);
            // Fallback to mock data if API fails
            return this.getMockProducts();
        }
    },

    async createProduct(product) {
        try {
            // Sanitize product data to prevent -Infinity errors
            const sanitizedProduct = {
                ...product,
                rating: (product.rating === undefined || product.rating === null || !isFinite(product.rating)) ? null : product.rating,
                quantity: (product.quantity === undefined || product.quantity === null || !isFinite(product.quantity)) ? 0 : product.quantity,
                price: (product.price === undefined || product.price === null || !isFinite(product.price)) ? 0 : product.price
            };
            
            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sanitizedProduct),
            });
            if (!response.ok) {
                throw new Error('Failed to create product');
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },

    async updateProduct(id, product) {
        try {
            // Validate required fields
            if (!product.name || product.name.trim() === '') {
                throw new Error('Product name is required');
            }
            
            // Sanitize product data to prevent -Infinity errors
            const sanitizedProduct = {
                ...product,
                rating: (product.rating === undefined || product.rating === null || !isFinite(product.rating)) ? null : product.rating,
                quantity: (product.quantity === undefined || product.quantity === null || !isFinite(product.quantity)) ? 0 : product.quantity,
                price: (product.price === undefined || product.price === null || !isFinite(product.price)) ? 0 : product.price,
                id: isFinite(product.id) ? product.id : id // Ensure id is valid
            };
            
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sanitizedProduct),
            });
            if (!response.ok) {
                throw new Error('Failed to update product');
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },

    async deleteProduct(id) {
        try {
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete product');
            }
            return await response.json();
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },

    getMockProducts() {
        return [
            {
                id: '1000',
                code: 'f230fh0g3',
                name: 'Bamboo Watch',
                description: 'Product Description',
                image: 'bamboo-watch.jpg',
                price: 65,
                category: 'Accessories',
                quantity: 24,
                location: 'Warehouse A',
                inventoryStatus: 'Daily',
                rating: 5,
                images: [
                    { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', caption: 'Product View 1' },
                    { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', caption: 'Product View 2' }
                ]
            },
            {
                id: '1001',
                code: 'nvklal433',
                name: 'Black Watch',
                description: 'Product Description',
                image: 'black-watch.jpg',
                price: 72,
                category: 'Accessories',
                quantity: 61,
                location: 'Warehouse B',
                inventoryStatus: 'Weekday',
                rating: 4,
                images: [
                    { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', caption: 'Warehouse View' }
                ]
            },
            {
                id: '1002',
                code: 'zz21cz3c1',
                name: 'Blue Band',
                description: 'Product Description',
                image: 'blue-band.jpg',
                price: 79,
                category: 'Fitness',
                quantity: 2,
                location: 'Store 1',
                inventoryStatus: 'Alt 1',
                rating: 3,
                images: []
            },
            {
                id: '1003',
                code: '244wgerg2',
                name: 'Blue T-Shirt',
                description: 'Product Description',
                image: 'blue-t-shirt.jpg',
                price: 29,
                category: 'Clothing',
                quantity: 25,
                location: 'Warehouse A',
                inventoryStatus: 'Daily',
                rating: 5
            },
            {
                id: '1004',
                code: 'h456wer53',
                name: 'Bracelet',
                description: 'Product Description',
                image: 'bracelet.jpg',
                price: 15,
                category: 'Accessories',
                quantity: 73,
                location: 'Store 2',
                inventoryStatus: 'Weekday',
                rating: 4
            },
            {
                id: '1005',
                code: 'av2231fwg',
                name: 'Brown Purse',
                description: 'Product Description',
                image: 'brown-purse.jpg',
                price: 120,
                category: 'Accessories',
                quantity: 0,
                location: 'Warehouse B',
                inventoryStatus: 'Alt 2',
                rating: 4
            },
            {
                id: '1006',
                code: 'bib36pfvm',
                name: 'Chakra Bracelet',
                description: 'Product Description',
                image: 'chakra-bracelet.jpg',
                price: 32,
                category: 'Accessories',
                quantity: 5,
                location: 'Store 1',
                inventoryStatus: 'Alt 1',
                rating: 3
            },
            {
                id: '1007',
                code: 'mbvjkgip5',
                name: 'Galaxy Earrings',
                description: 'Product Description',
                image: 'galaxy-earrings.jpg',
                price: 34,
                category: 'Accessories',
                quantity: 23,
                location: 'Warehouse A',
                inventoryStatus: 'Daily',
                rating: 5
            },
            {
                id: '1008',
                code: 'vbb124btr',
                name: 'Game Controller',
                description: 'Product Description',
                image: 'game-controller.jpg',
                price: 99,
                category: 'Electronics',
                quantity: 2,
                location: 'Store 2',
                inventoryStatus: 'Alt 1',
                rating: 4
            },
            {
                id: '1009',
                code: 'cm230f032',
                name: 'Gaming Set',
                description: 'Product Description',
                image: 'gaming-set.jpg',
                price: 299,
                category: 'Electronics',
                quantity: 63,
                location: 'Warehouse B',
                inventoryStatus: 'Weekday',
                rating: 3
            }
        ];
    }
};
