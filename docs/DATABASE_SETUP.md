# Setup Database PostgreSQL

## ✅ Setup Selesai!

Database PostgreSQL telah berjaya disetup dengan:

### 1. Backend Server (Express.js)
- 📂 Lokasi: `/server`
- 🔌 Port: 3001
- 🗄️ Database: PostgreSQL (Neon)

### 2. Struktur Database
Dua table telah dibuat:
- **customers**: Menyimpan data pelanggan
- **products**: Menyimpan data produk

### 3. API Endpoints

#### Customers
- `GET /api/customers` - Dapatkan semua customers
- `GET /api/customers/:id` - Dapatkan customer tertentu
- `POST /api/customers` - Tambah customer baru
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Hapus customer

#### Products
- `GET /api/products` - Dapatkan semua products
- `GET /api/products/:id` - Dapatkan product tertentu
- `POST /api/products` - Tambah product baru
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Hapus product

### 4. Cara Menjalankan

#### Langkah 1: Install concurrently (sekali sahaja)
```bash
npm install concurrently
```

#### Langkah 2: Initialize database (sekali sahaja)
```bash
npm run init-db
```

#### Langkah 3: Jalankan aplikasi
```bash
# Jalankan frontend dan backend serentak
npm run dev

# ATAU jalankan secara berasingan:

# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm start
```

### 5. File Penting
- `.env` - Mengandungi DATABASE_URL anda
- `server/db.js` - Konfigurasi database connection
- `server/index.js` - Express server utama
- `server/initDb.js` - Script untuk buat table & data sample
- `server/routes/` - API endpoints

### 6. Frontend Services Updated
- `src/service/CustomerService.js` - Sekarang fetch dari API
- `src/service/ProductService.js` - Sekarang fetch dari API

### 🔒 Keselamatan
File `.env` tidak akan di-commit ke Git (sudah ada di .gitignore)

### 🎯 Apa Yang Perlu Dibuat Seterusnya

1. Install concurrently: `npm install concurrently`
2. Initialize database: `npm run init-db`
3. Jalankan aplikasi: `npm run dev`
4. Buka browser: http://localhost:5173 (frontend) dan http://localhost:3001 (backend)

Aplikasi anda sekarang menggunakan database PostgreSQL yang sebenar! 🎉
