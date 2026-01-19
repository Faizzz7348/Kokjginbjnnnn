#!/bin/bash

echo "🚀 Starting application with port cleanup..."
echo ""

# Kill any existing processes on ports
echo "🧹 Cleaning up ports..."
lsof -ti:3001 | xargs kill -9 2>/dev/null && echo "✓ Cleaned port 3001" || echo "✓ Port 3001 already free"
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "✓ Cleaned port 3000" || echo "✓ Port 3000 already free"
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "✓ Cleaned port 5173" || echo "✓ Port 5173 already free"

echo ""
echo "⏳ Starting servers..."
echo ""

# Start the application
npm run dev
