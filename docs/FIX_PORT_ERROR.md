# 🔧 Fix Port Forwarding Error

## Masalah: "Error forwarding port"

Ini berlaku bila port sudah digunakan oleh process lain.

---

## ✅ Penyelesaian Cepat

### Cara 1: Guna script automatik (RECOMMENDED)
```bash
npm run dev:clean
```
Script ni akan:
1. Kill semua process yang guna port 3001, 5173, 3000
2. Start backend + frontend automatically

### Cara 2: Manual cleanup
```bash
# Make script executable
chmod +x fix-ports.sh

# Run cleanup script
./fix-ports.sh

# Then start app
npm run dev
```

### Cara 3: Kill specific port
```bash
# Check apa process guna port
lsof -i :3001

# Kill process (ganti PID dengan nombor dari command atas)
kill -9 <PID>

# Example:
# kill -9 12345
```

---

## 🎯 Port Yang Digunakan

- **Backend (Express)**: Port 3001
- **Frontend (Vite)**: Port 5173
- **Alternative**: Port 3000

---

## 📌 Common Issues & Fix

### Issue 1: Backend tak start
```bash
# Check if port 3001 is occupied
lsof -i :3001

# Kill the process
kill -9 $(lsof -ti:3001)

# Start backend
npm run server
```

### Issue 2: Frontend tak start
```bash
# Check if port 5173 is occupied
lsof -i :5173

# Kill the process
kill -9 $(lsof -ti:5173)

# Start frontend
npm run start
```

### Issue 3: Multiple node processes running
```bash
# Find all node processes
ps aux | grep node

# Kill all node processes (CAREFUL!)
pkill node

# Or kill specific process
kill -9 <PID>
```

---

## 🚀 Proper Startup Sequence

**Recommended way:**
```bash
# 1. Initialize database (one time only)
npm run init-db

# 2. Start everything with clean ports
npm run dev:clean
```

**Or manual way:**
```bash
# 1. Initialize database
npm run init-db

# 2. Clean ports
./fix-ports.sh

# 3. Start backend
npm run server

# 4. In another terminal, start frontend
npm start
```

---

## 💡 Prevention Tips

1. Always use `npm run dev:clean` untuk avoid port conflicts
2. Jangan run multiple `npm run dev` at same time
3. Kalau stop app, make sure both frontend & backend processes terminated
4. Use `Ctrl+C` untuk stop properly, jangan just close terminal

---

## ⚠️ Note

Kalau masih ada issue, restart VS Code atau dev container:
1. Press `F1`
2. Type: "Rebuild Container"
3. Select "Remote-Containers: Rebuild Container"
