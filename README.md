# Room Finder Backend API

A Node.js + Express backend API for Room Finder, an Airbnb-style platform for booking guest houses in Cameroon.

## 🚀 Features

- **User Management**: Registration, authentication, and profile management
- **Property Management**: List, search, and manage guest houses
- **Booking System**: Reserve properties with date selection
- **Reviews & Ratings**: Rate and review properties and guests
- **Messaging**: In-app communication between hosts and guests
- **Payment Integration**: Support for mobile money (MTN, Orange)

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Deployment**: Railway

## 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd room-finder-backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:

```bash
npm run dev
```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (coming soon)

## 📁 Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Data models
├── routes/          # API routes
├── utils/           # Utility functions
└── server.js        # Main server file
```

## 🌐 API Endpoints

### Base URL: `http://localhost:3000/api/v1`

- `GET /` - API welcome message
- `GET /health` - Health check endpoint

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
API_VERSION=v1
API_PREFIX=/api/v1
DATABASE_URL=your-railway-postgresql-connection-string
```

## 🚀 Railway Deployment

This project is configured for deployment on Railway:

1. **Database Setup**: Follow the [Railway Setup Guide](RAILWAY_SETUP.md)
2. **Deploy**: Connect your GitHub repository to Railway
3. **Environment Variables**: Add all variables in Railway dashboard

## 🚀 Deployment

This project is configured for deployment on Railway. The deployment will be set up in the next steps.

## 📝 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
