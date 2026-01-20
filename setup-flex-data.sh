#!/bin/bash

echo "🚀 Setting up Flex Table Sample Data..."
echo ""

# Check if parent products exist
echo "1️⃣ Checking for parent products..."
parent_count=$(node -e "
const pool = require('./server/db');
pool.query('SELECT COUNT(*) FROM products WHERE parent_id IS NULL')
  .then(res => {
    console.log(res.rows[0].count);
    process.exit(0);
  })
  .catch(err => {
    console.log('0');
    process.exit(1);
  });
" 2>/dev/null)

if [ "$parent_count" = "0" ]; then
    echo "⚠️  No parent products found!"
    echo "📝 Please add some parent products first via the UI"
    echo ""
    echo "💡 Tip: Click 'Add Row' button in the main table to add parent products"
    exit 1
fi

echo "✅ Found $parent_count parent product(s)"
echo ""

# Run seeding
echo "2️⃣ Seeding flex table data..."
npm run seed-flex

echo ""
echo "3️⃣ Verifying data..."
npm run check-flex

echo ""
echo "✅ All done! Open the app and click 'Flex Table' button to see the sample data!"
echo "🌐 Your app should be running at: http://localhost:5173"
