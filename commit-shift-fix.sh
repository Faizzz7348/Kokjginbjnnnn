#!/bin/bash

echo "📝 Committing shift column fixes..."
echo ""

git add -A

git commit -m "fix: resolve shift column data display issue

- Update statusBodyTemplate to render Tag component with proper color coding
- Fix default inventoryStatus value from 'INSTOCK' to 'AM' for new rows
- Ensure shift data (AM/PM) displays correctly with color-coded tags
- Add null check to prevent empty shift column display"

echo ""
echo "✅ Changes committed successfully!"
echo ""
echo "To push to GitHub, run:"
echo "   git push origin main"
