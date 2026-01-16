# PrimeReact DataTable with Dark Mode

Aplikasi React dengan PrimeReact DataTable yang memiliki fitur:
- DataTable dengan scroll di dalam Dialog
- Dark Mode / Light Mode toggle
- Customer data sample

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

### 1. DataTable dengan Dialog
- Klik tombol "Show" untuk membuka dialog
- DataTable menampilkan data customer
- Scrollable table di dalam dialog
- Dialog dapat di-maximize

### 2. Dark Mode
- Klik tombol toggle di bagian atas untuk switch antara Dark Mode dan Light Mode
- Menggunakan official PrimeReact themes:
  - `lara-dark-blue` untuk dark mode
  - `lara-light-blue` untuk light mode

## Teknologi yang Digunakan

- React 18
- PrimeReact 10
- PrimeIcons
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