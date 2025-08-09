import express from 'express';
import { protect } from '../middleware/auth';
import {
  getGoogleDriveAuthUrl,
  connectGoogleDrive,
  getGoogleDriveStatus,
  disconnectGoogleDrive,
  syncFromGoogleDrive,
} from '../controllers/googleDriveController';
import { connectGoogleDriveValidation } from '../validation/googleDriveValidation';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Google Drive routes
router.get('/auth-url', getGoogleDriveAuthUrl);
router.post('/connect', connectGoogleDriveValidation, connectGoogleDrive);
router.get('/status', getGoogleDriveStatus);
router.post('/disconnect', disconnectGoogleDrive);
router.post('/sync', syncFromGoogleDrive);

export default router;