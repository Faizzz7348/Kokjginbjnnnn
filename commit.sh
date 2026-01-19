#!/bin/bash

echo "📝 Committing database configuration changes..."
echo ""

git add -A

git commit -m "fix: update database connection settings for Neon PostgreSQL

- Add connection pool settings (max, timeout)
- Remove channel_binding parameter for compatibility
- Optimize connection settings for Neon database stability"

echo ""
echo "✅ Changes committed!"
echo ""
echo "To push to GitHub:"
echo "   git push origin main"
