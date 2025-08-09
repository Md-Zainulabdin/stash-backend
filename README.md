# Stash Backend API

A Node.js/Express backend API for the Stash student content organization app with Google Drive integration.

## Features

- 🔐 JWT Authentication
- 📁 File upload and management
- 📚 Subject organization
- ☁️ Google Drive integration
- 🚀 TypeScript support
- 📝 Input validation
- 🛡️ Error handling

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Google Cloud Console project (for Google Drive integration)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stash-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/stash
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/google-drive/callback
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## API Documentation

See [API_GUIDE.md](./API_GUIDE.md) for complete API documentation.

## Google Drive Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add your redirect URI to the credentials
6. Copy Client ID and Client Secret to your `.env` file

## Database Setup

### Local MongoDB
```bash
# Install MongoDB locally
# Start MongoDB service
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### MongoDB Atlas
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route handlers
├── middleware/      # Express middleware
├── models/          # Mongoose models
├── routes/          # Express routes
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── validation/      # Input validation
├── app.ts          # Express app setup
└── server.ts       # Server entry point
```

## Error Handling

The API includes comprehensive error handling:
- Input validation using express-validator
- Database error handling
- File operation error handling
- Google Drive API error handling

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input sanitization
- File type validation
- File size limits (10MB)

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Ensure network access (for Atlas)

2. **Google Drive Integration Issues**
   - Verify OAuth credentials
   - Check redirect URI configuration
   - Ensure Google Drive API is enabled

3. **File Upload Issues**
   - Check uploads directory permissions
   - Verify file size limits
   - Check file type restrictions

4. **TypeScript Errors**
   - Run `npm install` to ensure all dependencies
   - Check `tsconfig.json` configuration
   - Verify type definitions

### Development Tips

- Use `npm run dev` for development with auto-restart
- Check console logs for detailed error messages
- Use Postman or similar tool to test API endpoints
- Monitor MongoDB logs for database issues

## License

MIT License - see LICENSE file for details.
