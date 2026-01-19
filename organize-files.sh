#!/bin/bash

# Move documentation files to docs folder
echo "📁 Moving documentation files to docs/..."
git mv BEFORE_AFTER_COMPARISON.md docs/ 2>/dev/null || true
git mv CHANGELOG.md docs/ 2>/dev/null || true
git mv COMPLETION_REPORT.md docs/ 2>/dev/null || true
git mv DOCS_INDEX.md docs/ 2>/dev/null || true
git mv IMAGE_COLUMN_FEATURES.md docs/ 2>/dev/null || true
git mv IMPLEMENTATION_SUMMARY.md docs/ 2>/dev/null || true
git mv VISUAL_GUIDE.md docs/ 2>/dev/null || true

# Delete duplicate index.html in public (Vite uses root index.html)
echo "🗑️  Removing duplicate files..."
git rm public/index.html 2>/dev/null || rm -f public/index.html

echo "✅ File organization complete!"
echo ""
echo "Files kept in root:"
echo "  - README.md"
echo "  - DATABASE_SETUP.md"
echo "  - VERCEL_DEPLOY.md"
echo ""
echo "Files moved to docs/:"
echo "  - All other documentation files"
echo ""
echo "Files deleted:"
echo "  - public/index.html (duplicate)"
