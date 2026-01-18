# PrimeReact DataTable with Dark Mode & Image Gallery

Aplikasi React dengan PrimeReact DataTable yang memiliki fitur:
- DataTable dengan scroll di dalam Dialog
- Dark Mode / Light Mode toggle
- **🆕 Image Column dengan Lightbox Gallery**
- **🆕 Image Management (Add/Delete)**
- **🆕 Multiple Images per Row**
- Flex Table dengan Row Editing
- Customer data sample

## ✨ New Features - Image Column

Column **Images** telah ditambah dengan full functionality:
- 🖼️ Image preview dengan thumbnail
- 🔍 Lightbox gallery dengan zoom
- 📸 Add/Delete images (Edit Mode)
- 🎨 Captions support
- 📱 Responsive design

**[📖 Read Full Documentation →](./IMAGE_COLUMN_FEATURES.md)**

## Struktur File

```
├── public/
│   └── index.html
├── src/
│   ├── service/
│   │   └── CustomerService.js
│   ├── App.jsx
│   ├── FlexibleScrollDemo.jsx
│   └── index.jsx
├── package.json
└── vite.config.js
```

## Instalasi

```bash
npm install
```

## Menjalankan Aplikasi

```bash
npm start
```

Aplikasi akan berjalan di http://localhost:3000

## Fitur

### 1. Flex Table dengan Row Editing
- Klik tombol "Flex Table" untuk membuka modal
- Edit rows secara inline (Edit Mode required)
- Add/Delete rows
- Column customization
- Pin rows untuk quick access
- Duplicate code detection

### 2. 🆕 Image Column & Gallery
- **View Images**: Click image preview untuk open lightbox
- **Lightbox Features**:
  - ✅ Full-screen viewer
  - ✅ Zoom (scroll to zoom, max 3x)
  - ✅ Thumbnails navigation
  - ✅ Captions display
  - ✅ Keyboard navigation (arrows)
- **Manage Images (Edit Mode)**:
  - ✅ Add images via URL
  - ✅ Add captions
  - ✅ Delete individual images
  - ✅ Multiple images per row
  - ✅ Grid layout display

### 3. Dark Mode
- Klik tombol toggle di bagian atas untuk switch antara Dark Mode dan Light Mode
- Menggunakan official PrimeReact themes:
  - `lara-dark-blue` untuk dark mode
  - `lara-light-blue` untuk light mode

## 🚀 Quick Start

### Test Image Features
1. Start application: `npm start`
2. Click **Flex Table** button on any row
3. See **Images** column (rows have sample images)
4. Click image preview to open **Lightbox Gallery**
5. Enable **Edit Mode** to add/manage images

### Add New Images
1. Enable Edit Mode
2. Open Flex Table
3. Click **+** or **pencil icon** on any row
4. Enter image URL (e.g., from Unsplash)
5. Add optional caption
6. Click **Add Image**

## 📚 Documentation

- **[IMAGE_COLUMN_FEATURES.md](./IMAGE_COLUMN_FEATURES.md)** - Detailed feature documentation
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Quick implementation summary

## Teknologi yang Digunakan

- React 18
- PrimeReact 10
- PrimeIcons
- **Yet Another React Lightbox** (Image gallery)
- Leaflet (Maps)
- Vite (build tool)

## Themes PrimeReact yang Tersedia

Jika ingin mengganti theme, edit file `src/App.jsx` dan ubah theme path:

**Dark Themes:**
- lara-dark-blue
- lara-dark-indigo
- lara-dark-purple
- lara-dark-teal

**Light Themes:**
- lara-light-blue
- lara-light-indigo
- lara-light-purple
- lara-light-teal