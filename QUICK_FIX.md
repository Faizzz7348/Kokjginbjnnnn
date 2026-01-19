# 🚨 PENYELESAIAN: Error Forwarding Port

## ✅ FIX SEKARANG! (Copy & Paste Command Ni)

Buka terminal dan jalankan:

```bash
chmod +x start.sh && npm run dev:clean
```

**ITU SAHAJA!** ✨

---

## 🎯 Apa Yang Berlaku?

Error "forwarding port" bermaksud:
- Port 3001 (backend) atau 
- Port 3000/5173 (frontend) 
sudah digunakan oleh process lain.

---

## 💡 Cara Guna Lepas Ni

### Start App (Recommended):
```bash
npm run dev:clean
```

### Clean Ports Only:
```bash
npm run clean-ports
```

### Normal Start (if ports clean):
```bash
npm run dev
```

---

## 🔍 Check Port Manually

```bash
# Check port 3001 (backend)
lsof -i :3001

# Check port 3000 (frontend)
lsof -i :3000

# Kill specific process
kill -9 <PID>
```

---

## ⚡ One-Time Setup

Sekiranya first time:

```bash
# 1. Make scripts executable
chmod +x fix-ports.sh start.sh

# 2. Initialize database (clear old data)
npm run init-db

# 3. Start app
npm run dev:clean
```

---

## 🎪 Ports Yang Digunakan

| Service | Port | URL |
|---------|------|-----|
| Backend API | 3001 | http://localhost:3001 |
| Frontend | 3000 | http://localhost:3000 |
| Alt Frontend | 5173 | http://localhost:5173 |

---

## ✨ Updated Features

✅ Auto port cleanup  
✅ Better error messages  
✅ Automatic port finding (frontend will try next port if occupied)  
✅ Database kosong (no sample data)  
✅ Data akan save properly bila backend running  

---

## 🆘 Masih Ada Masalah?

Try restart dev container:
1. Press `F1` or `Ctrl+Shift+P`
2. Type: "Rebuild Container"
3. Select: "Dev Containers: Rebuild Container"

**ATAU** restart VS Code completely.
