#!/bin/bash

echo "🧹 Starting cleanup process..."
echo ""

# 1. Move .md files to docs folder
echo "📁 Moving .md files to docs folder..."
mv DATABASE_SETUP.md docs/ 2>/dev/null && echo "  ✅ Moved DATABASE_SETUP.md" || echo "  ⚠️  DATABASE_SETUP.md already moved or not found"
mv FIX_PORT_ERROR.md docs/ 2>/dev/null && echo "  ✅ Moved FIX_PORT_ERROR.md" || echo "  ⚠️  FIX_PORT_ERROR.md already moved or not found"
mv QUICK_FIX.md docs/ 2>/dev/null && echo "  ✅ Moved QUICK_FIX.md" || echo "  ⚠️  QUICK_FIX.md already moved or not found"
mv VERCEL_DEPLOY.md docs/ 2>/dev/null && echo "  ✅ Moved VERCEL_DEPLOY.md" || echo "  ⚠️  VERCEL_DEPLOY.md already moved or not found"

echo ""
echo "🗑️  Removing unused files..."

# 2. Remove duplicate/unused shell scripts
rm -f commit.sh && echo "  ✅ Deleted commit.sh (duplicate)" || echo "  ⚠️  commit.sh not found"
rm -f commit-changes.sh && echo "  ✅ Deleted commit-changes.sh (duplicate)" || echo "  ⚠️  commit-changes.sh not found"

# 3. Remove test-api.html (unused test file)
rm -f test-api.html && echo "  ✅ Deleted test-api.html (unused)" || echo "  ⚠️  test-api.html not found"

# 4. Remove unused component
rm -f src/components/AnimatedModal.jsx && echo "  ✅ Deleted AnimatedModal.jsx (unused)" || echo "  ⚠️  AnimatedModal.jsx not found"

echo ""
echo "✨ Cleanup complete!"
echo ""
echo "📋 Summary:"
echo "  - Moved 4 .md files to docs/"
echo "  - Removed 2 duplicate shell scripts"
echo "  - Removed test-api.html"
echo "  - Removed unused AnimatedModal component"
echo ""
echo "📁 Current structure:"
ls -la | grep -E '\.(md|sh|html)$' || echo "  No loose .md, .sh, or test .html files in root ✓"
