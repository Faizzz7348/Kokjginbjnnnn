# Vercel Deployment Guide

## 🚀 Deploy ke Vercel

### 1. Setup Vercel CLI (Pilihan)
```bash
npm install -g vercel
```

### 2. Deploy Menggunakan Dashboard Vercel

#### Langkah 1: Push ke GitHub
```bash
git add .
git commit -m "Setup Vercel configuration"
git push origin main
```

#### Langkah 2: Import Project di Vercel
1. Pergi ke [vercel.com](https://vercel.com)
2. Login dengan GitHub
3. Klik **"Add New Project"**
4. Import repository **Kokjginbjnnnn**
5. Vercel akan auto-detect Vite configuration

#### Langkah 3: Setup Environment Variables
Dalam Vercel Dashboard, tambah Environment Variable:

**Key:** `DATABASE_URL`
**Value:** `postgresql://neondb_owner:npg_2Uo3gyXRKIGi@ep-bitter-recipe-ad7w7gwg-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

#### Langkah 4: Deploy!
Klik **"Deploy"** - Vercel akan build dan deploy aplikasi anda.

### 3. Update Frontend Service untuk Production

Selepas deploy, update API URL dalam service files:

**src/service/CustomerService.js** & **src/service/ProductService.js**:
```javascript
const API_URL = process.env.NODE_ENV === 'production' 
    ? '' // Vercel will use same domain
    : 'http://localhost:3001/api';
```

### 4. Initialize Database (Sekali Sahaja)

Selepas deploy pertama, run init database:
```bash
# Local
npm run init-db

# Atau connect ke Neon dashboard dan run SQL script
```

### 📁 File Structure untuk Vercel:
```
/
├── api/
│   └── index.js          # Serverless API functions
├── dist/                 # Build output (auto-generated)
├── src/                  # React source code
├── vercel.json          # Vercel configuration
└── package.json
```

### 🔧 Cara Kerja:
- **Frontend**: Build sebagai static files (Vite)
- **Backend**: Deploy sebagai Serverless Functions
- **Database**: Connect ke Neon PostgreSQL
- **API Routes**: `/api/*` akan route ke serverless functions

### 🌐 Domain:
Selepas deploy, anda akan dapat URL:
- Production: `https://kokjginbjnnnn.vercel.app`
- API: `https://kokjginbjnnnn.vercel.app/api/customers`

### ⚡ Auto Deploy:
Setiap `git push` ke `main` branch akan trigger auto deployment!

### 🔐 Environment Variables di Vercel:
1. Go to Project Settings
2. Environment Variables
3. Add `DATABASE_URL`
4. Save & Redeploy

## Alternative: Deploy menggunakan CLI
```bash
vercel
# Follow prompts
# Setup environment variables when asked
```

Selamat deploy! 🎉
