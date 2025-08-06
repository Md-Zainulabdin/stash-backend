import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth';
import subjectRoutes from './routes/subjects';
import fileRoutes from './routes/files';
import googleDriveRoutes from './routes/googleDrive';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically (for offline access)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/google-drive', googleDriveRoutes);

// Test routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Stash Backend API is running!',
    version: '1.0.0',
    status: 'healthy'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;