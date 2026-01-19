#!/bin/bash

echo "🔍 Checking for processes using ports..."

# Kill processes on port 3001 (backend)
PORT_3001=$(lsof -ti:3001 2>/dev/null)
if [ ! -z "$PORT_3001" ]; then
    echo "⚠️  Port 3001 is in use by process $PORT_3001"
    kill -9 $PORT_3001 2>/dev/null
    echo "✅ Killed process on port 3001"
else
    echo "✅ Port 3001 is free"
fi

# Kill processes on port 5173 (vite)
PORT_5173=$(lsof -ti:5173 2>/dev/null)
if [ ! -z "$PORT_5173" ]; then
    echo "⚠️  Port 5173 is in use by process $PORT_5173"
    kill -9 $PORT_5173 2>/dev/null
    echo "✅ Killed process on port 5173"
else
    echo "✅ Port 5173 is free"
fi

# Kill processes on port 3000
PORT_3000=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$PORT_3000" ]; then
    echo "⚠️  Port 3000 is in use by process $PORT_3000"
    kill -9 $PORT_3000 2>/dev/null
    echo "✅ Killed process on port 3000"
else
    echo "✅ Port 3000 is free"
fi

echo ""
echo "🎉 Ports cleaned! Now you can run:"
echo "   npm run dev"
