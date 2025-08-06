import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/database';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('📝 Stash Backend v1.0.0');
    console.log('🔐 Auth endpoints: /api/auth/register, /api/auth/login');
  });
};

startServer();