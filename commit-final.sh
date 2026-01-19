#!/bin/bash

echo "📝 Committing changes..."
echo ""

git add -A

git commit -m "feat: enhance flex table UX with smooth transitions and cleanup

- Add smooth transitions for row editing (0.4s cubic-bezier)
- Add fade-in scale animation for input fields and edit buttons
- Enhance edit button interactions with scale and color transitions
- Hide delete column when no rows are in edit mode
- Move documentation files to docs/ folder (DATABASE_SETUP, FIX_PORT_ERROR, QUICK_FIX, VERCEL_DEPLOY)
- Remove duplicate shell scripts (commit.sh, commit-changes.sh)
- Remove unused test-api.html file
- Remove unused AnimatedModal.jsx component
- Improve table cell transitions with smooth padding adjustments
- Add focus effects for input fields (scale + glow)
- Update button hover states with enhanced visual feedback"

echo ""
echo "✅ Changes committed successfully!"
echo ""
echo "To push to GitHub, run:"
echo "   git push origin main"
