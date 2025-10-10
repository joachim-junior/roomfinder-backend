#!/bin/bash

echo "======================================"
echo "Database Cleanup for Production"
echo "======================================"
echo ""
echo "⚠️  WARNING: This will DELETE ALL DATA!"
echo ""

echo "Step 1: Stopping any running servers..."
pkill -f "node.*server.js" 2>/dev/null || echo "No server running"
sleep 2

echo ""
echo "Step 2: Resetting database (clearing all data)..."
npx prisma migrate reset --force --skip-seed

echo ""
echo "Step 3: Running migrations..."
npx prisma migrate deploy

echo ""
echo "Step 4: Creating production admin user..."
node src/utils/createAdminUser.js

echo ""
echo "Step 5: Verifying database setup..."
echo ""

# Check if admin was created
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  const totalUsers = await prisma.user.count();
  
  console.log('✅ Database Statistics:');
  console.log('   - Total Users:', totalUsers);
  console.log('   - Admin Users:', adminCount);
  console.log('   - Properties:', await prisma.property.count());
  console.log('   - Bookings:', await prisma.booking.count());
  console.log('   - Notifications:', await prisma.notification.count());
  
  await prisma.\$disconnect();
}

check();
"

echo ""
echo "======================================"
echo "✅ Production Database Ready!"
echo "======================================"
echo ""
echo "Admin Credentials:"
echo "  Email: hansyufewonge@roomfinder237.com"
echo "  Password: @Hans123"
echo ""
echo "Next steps:"
echo "  1. Test admin login"
echo "  2. Verify all endpoints"
echo "  3. Deploy to production"
echo ""
