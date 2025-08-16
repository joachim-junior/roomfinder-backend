# Database Setup Guide

This guide will help you set up PostgreSQL and Prisma for the Room Finder backend.

## Prerequisites

1. **PostgreSQL Installation**

   - Install PostgreSQL on your system
   - For Ubuntu/Debian: `sudo apt install postgresql postgresql-contrib`
   - For macOS: `brew install postgresql`
   - For Windows: Download from https://www.postgresql.org/download/windows/

2. **Node.js and npm** (already installed)

## Database Setup

### 1. Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE room_finder;

# Create user (replace 'your_username' and 'your_password')
CREATE USER your_username WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE room_finder TO your_username;

# Exit psql
\q
```

### 3. Update Environment Variables

Edit the `.env` file and update the DATABASE_URL:

```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/room_finder"
```

### 4. Run Database Migrations

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or create and run migrations (for production)
npm run db:migrate
```

### 5. Seed the Database (Optional)

```bash
# Run the seed script to populate with test data
npm run db:seed
```

## Available Database Commands

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:reset` - Reset database and run migrations
- `npm run db:seed` - Seed database with test data

## Database Schema Overview

### Models

1. **User** - Users (guests, hosts, admins)

   - Authentication and profile information
   - Role-based access control

2. **Property** - Rental properties

   - Property details, location, pricing
   - Amenities and images
   - Host relationship

3. **Booking** - Property reservations

   - Check-in/out dates
   - Guest count and pricing
   - Booking status

4. **Review** - Property reviews

   - Ratings and comments
   - User and property relationships

5. **Message** - User communication
   - Direct messaging between users
   - Read status tracking

### Enums

- **UserRole**: GUEST, HOST, ADMIN
- **PropertyType**: APARTMENT, HOUSE, VILLA, STUDIO, GUESTHOUSE, ROOM, OTHER
- **BookingStatus**: PENDING, CONFIRMED, CANCELLED, COMPLETED

## Testing the Setup

1. **Start the server**:

   ```bash
   npm run dev
   ```

2. **Test database connection**:

   ```bash
   curl http://localhost:5000/health/db
   ```

3. **Open Prisma Studio** (optional):
   ```bash
   npm run db:studio
   ```

## Troubleshooting

### Common Issues

1. **Connection Refused**

   - Ensure PostgreSQL is running: `sudo systemctl status postgresql`
   - Check if port 5432 is open: `netstat -an | grep 5432`

2. **Authentication Failed**

   - Verify username/password in DATABASE_URL
   - Check pg_hba.conf for authentication settings

3. **Database Not Found**

   - Create the database: `CREATE DATABASE room_finder;`
   - Check database name in DATABASE_URL

4. **Permission Denied**
   - Grant proper privileges to the user
   - Check PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`

### Useful PostgreSQL Commands

```bash
# Connect to database
psql -U your_username -d room_finder

# List databases
\l

# List tables
\dt

# Describe table
\d table_name

# Exit psql
\q
```

## Production Considerations

1. **Environment Variables**

   - Use strong passwords
   - Store sensitive data securely
   - Use different databases for dev/staging/prod

2. **Database Security**

   - Configure firewall rules
   - Use SSL connections
   - Regular backups

3. **Performance**
   - Add database indexes
   - Monitor query performance
   - Consider connection pooling

## Next Steps

After setting up the database:

1. Create API routes for each model
2. Implement authentication middleware
3. Add validation and error handling
4. Set up file upload for property images
5. Implement search and filtering
6. Add payment integration
