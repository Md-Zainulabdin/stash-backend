import express from 'express';
import { protect } from '../middleware/auth';
import {
  getGoogleDriveAuthUrl,
  connectGoogleDrive,
  getGoogleDriveStatus,
  disconnectGoogleDrive,
  syncFromGoogleDrive
} from '../controllers/googleDriveController';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Google Drive routes
router.get('/auth-url', getGoogleDriveAuthUrl);
router.post('/connect', connectGoogleDrive);
router.get('/status', getGoogleDriveStatus);
router.post('/disconnect', disconnectGoogleDrive);
router.post('/sync', syncFromGoogleDrive);

export default router;