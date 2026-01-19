#!/bin/bash

# Commit script
echo "📝 Committing changes..."

git add -A

git commit -m "feat: integrate database CRUD operations and add port management tools

- Add database integration for products and customers with full CRUD operations
- Connect frontend to PostgreSQL backend for real-time data persistence
- Add ProductService and CustomerService methods (create, update, delete)
- Update RowEditingDemo to call API for add, edit, delete operations
- Add check-db script to verify database status
- Add port cleanup scripts (fix-ports.sh, start.sh) to resolve port conflicts
- Improve server error handling for EADDRINUSE errors
- Update initDb to drop existing tables for clean database setup
- Add test-api.html for manual API testing
- Add documentation (FIX_PORT_ERROR.md, QUICK_FIX.md) for troubleshooting
- Configure vite to auto-find available ports (strictPort: false)
- Fix snake_case to camelCase mapping for inventoryStatus field"

echo ""
echo "✅ Changes committed successfully!"
echo ""
echo "To push to GitHub, run:"
echo "   git push origin main"
