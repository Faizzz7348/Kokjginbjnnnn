#!/bin/bash

echo "📝 Committing changes..."
echo ""

git add -A

git commit -m "feat: enhance flex table UX and simplify shift column display

- Add smooth transitions for row editing (0.4s cubic-bezier)
- Add fade-in scale animation for input fields and edit buttons
- Enhance edit button interactions with scale and color transitions
- Hide delete column when no rows are in edit mode
- Remove Tag/Badge from shift column, display as plain text
- Simplify shift dropdown to show plain text options
- Fix shift data display issue with proper null handling
- Set default shift value to 'AM' for new rows
- Move documentation files to docs/ folder
- Remove duplicate shell scripts and unused files
- Improve table cell transitions with smooth padding adjustments"

echo ""
echo "✅ Changes committed successfully!"
echo ""
echo "To push to GitHub, run:"
echo "   git push origin main"
