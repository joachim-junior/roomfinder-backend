# Railway Database Setup Guide

This guide will help you set up PostgreSQL on Railway and connect it to your Room Finder backend.

## Step 1: Create Railway Account

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub or Google
3. Create a new project

## Step 2: Provision PostgreSQL Database

1. **Create New Project**

   - Click "New Project"
   - Select "Provision PostgreSQL"

2. **Get Connection Details**
   - Railway will automatically create a PostgreSQL database
   - Go to your database service
   - Click on "Connect" tab
   - Copy the connection string

## Step 3: Update Environment Variables

1. **Update .env file**
   Replace the DATABASE_URL in your `.env` file with the Railway connection string:

   ```env
   DATABASE_URL="postgresql://postgres:password@containers-us-west-XX.railway.app:XXXX/railway"
   ```

2. **Example Railway connection string format**:
   ```
   postgresql://postgres:password@containers-us-west-XX.railway.app:XXXX/railway
   ```

## Step 4: Test Database Connection

1. **Generate Prisma Client**:

   ```bash
   npm run db:generate
   ```

2. **Push Schema to Database**:

   ```bash
   npm run db:push
   ```

3. **Test Connection**:
   ```bash
   curl http://localhost:5000/health/db
   ```

## Step 5: Seed the Database (Optional)

```bash
npm run db:seed
```

## Step 6: Deploy to Railway (Optional)

You can also deploy your entire application to Railway:

1. **Connect GitHub Repository**

   - Go to Railway dashboard
   - Click "New Service" → "GitHub Repo"
   - Connect your repository

2. **Configure Environment Variables**

   - Add all your environment variables in Railway dashboard
   - Make sure to include the DATABASE_URL

3. **Deploy**
   - Railway will automatically deploy your app
   - Your API will be available at the provided URL

## Railway Dashboard Features

### Database Management

- **View Data**: Use Railway's built-in data viewer
- **Query Editor**: Run SQL queries directly
- **Backups**: Automatic backups (with paid plans)
- **Metrics**: Monitor database performance

### Environment Variables

- **Secure Storage**: Environment variables are encrypted
- **Team Access**: Share variables with team members
- **Version Control**: Track changes to environment variables

## Production Considerations

### Security

1. **Strong Passwords**: Use strong database passwords
2. **SSL Connections**: Railway provides SSL by default
3. **Access Control**: Limit database access to your application only

### Performance

1. **Connection Pooling**: Prisma handles this automatically
2. **Indexes**: Add indexes for frequently queried fields
3. **Monitoring**: Use Railway's built-in monitoring

### Backup Strategy

1. **Automatic Backups**: Railway provides automatic backups
2. **Manual Backups**: Export data when needed
3. **Point-in-time Recovery**: Available with paid plans

## Troubleshooting

### Common Issues

1. **Connection Refused**

   - Check if the connection string is correct
   - Verify the database is running in Railway
   - Ensure your IP is not blocked

2. **Authentication Failed**

   - Verify username/password in connection string
   - Check if the database user has proper permissions

3. **Schema Push Failed**
   - Make sure the database is accessible
   - Check if there are any schema conflicts
   - Try running `npm run db:generate` first

### Useful Commands

```bash
# Test database connection
npm run db:generate
npm run db:push

# View database in browser
npm run db:studio

# Reset database (careful!)
npm run db:reset

# Seed with test data
npm run db:seed
```

## Next Steps

After setting up Railway:

1. **Test the Connection**: Ensure your app can connect to Railway
2. **Deploy Your App**: Consider deploying the entire app to Railway
3. **Set Up Monitoring**: Monitor database performance
4. **Create Backups**: Set up regular backup schedules
5. **Scale**: Upgrade your Railway plan as needed

## Railway Pricing

- **Free Tier**: $5 credit monthly
- **Pro Plan**: $20/month for more resources
- **Team Plan**: $40/month for team collaboration

## Support

- **Railway Docs**: https://docs.railway.app
- **Discord Community**: https://discord.gg/railway
- **GitHub Issues**: https://github.com/railwayapp/railway
