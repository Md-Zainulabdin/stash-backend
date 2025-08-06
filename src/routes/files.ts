import express from 'express';
import { protect } from '../middleware/auth';
import { upload } from '../config/upload';
import {
  uploadFile,
  getSubjectFiles,
  getUserFiles,
  downloadFile,
  deleteFile
} from '../controllers/fileController';
import {
  uploadFileValidation,
  getSubjectFilesValidation,
  downloadFileValidation,
  deleteFileValidation
} from '../validation/fileValidation';

const router = express.Router();

// All routes require authentication
router.use(protect);

// File routes
router.post(
  '/upload', 
  upload.array('files', 10), // allow up to 10 files at once
  uploadFileValidation,
  uploadFile
);
router.get(
  '/subject/:subjectId', 
  getSubjectFilesValidation,
  getSubjectFiles
);
router.get('/', getUserFiles);
router.get(
  '/download/:fileId', 
  downloadFileValidation,
  downloadFile
);
router.delete(
  '/:fileId', 
  deleteFileValidation,
  deleteFile
);

export default router;