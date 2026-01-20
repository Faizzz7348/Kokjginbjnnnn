# 🌱 Flex Table Sample Data - Quick Guide

## Cara Menambah Sample Data untuk Flex Table

### 📋 Langkah-langkah:

1. **Update database schema (jika belum):**
   ```bash
   npm run migrate-db
   ```
   Ini akan tambah columns yang diperlukan tanpa delete data existing.

2. **Pastikan ada parent products dulu** (main table rows)
   
3. **Jalankan seeding command:**
   ```bash
   npm run seed-flex
   ```

4. **Verify data (optional):**
   ```bash
   npm run check-flex
   ```

5. **Lihat hasilnya:**
   - Buka aplikasi
   - Klik button "Flex Table" pada mana-mana row
   - Anda akan nampak 5-8 sample rows dengan:
     - ✅ Lokasi berbeza (VM-001, VM-002, dll.)
     - ✅ GPS coordinates
     - ✅ Delivery status (AM/PM)
     - ✅ Power Mode (ON/OFF/Not Set)
     - ✅ Images (some rows)
     - ✅ Address lengkap
     - ✅ Operating hours & machine info

### 📊 Sample Data yang Ditambah:

Setiap parent product akan dapat **5-8 sample flex rows** dengan lokasi seperti:
- 📍 Lobby Area - Main Building
- 📍 Cafeteria - Level 2
- 📍 Office Block A - Entrance
- 📍 Parking Level B1
- 📍 Gym & Fitness Center
- 📍 Conference Room Floor
- 📍 Sky Garden - Level 10
- 📍 Staff Lounge - HR Department

### 🖼️ Images:
- Beberapa rows ada 2-3 images
- Beberapa rows ada 1 image
- Beberapa rows tiada images (untuk test variety)

### 🔄 Untuk Reset & Seed Semula:

```bash
# Option 1: Migrate (keeps existing data)
npm run migrate-db     # Add missing columns
npm run seed-flex      # Add flex data
npm run check-flex     # Verify

# Option 2: Fresh start (deletes all data)
npm run init-db        # Reset database
# Tambah parent products (via UI atau API)
npm run seed-flex      # Add flex data
npm run check-flex     # Verify
```

### 📝 Available Commands:

| Command | Description |
|---------|-------------|
| `npm run migrate-db` | **Add missing columns (safe - keeps data)** |
| `npm run init-db` | Reset database (creates fresh tables - deletes data) |
| `npm run seed-flex` | Add sample flex table data |
| `npm run check-flex` | Show all flex table data |
| `npm run check-db` | Check database connection |

### ⚠️ Troubleshooting:

**Error: column "power_mode" does not exist**
```bash
npm run migrate-db
```
This adds the missing columns without deleting your data!

### ✨ Features dalam Sample Data:
- ✅ Power Mode (30% on, 30% off, 40% not set)
- ✅ GPS coordinates (realistic KL area)
- ✅ Full address
- ✅ Operating hours
- ✅ Machine type & payment methods
- ✅ Last maintenance info (random 1-10 days)
- ✅ Status (Active/Operational)
- ✅ Variety of delivery status (AM/PM)

---

**Happy Testing! 🎉**

