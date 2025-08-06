import mongoose from 'mongoose';

interface IFile {
  originalName: string;
  fileName: string;
  filePath?: string; // Local path for offline access
  fileSize: number;
  mimeType: string;
  fileCategory: 'Images' | 'PDFs' | 'Sheets' | 'Docs' | 'Others';
  
  // Google Drive specific
  googleDriveId?: string; // File ID in Google Drive
  googleDriveFolderId?: string; // Parent folder ID in Google Drive
  driveFileUrl?: string; // Direct access URL
  
  // Offline support
  isAvailableOffline: boolean;
  lastSyncAt?: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
  
  subjectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  uploadedAt: Date;
}

const fileSchema = new mongoose.Schema<IFile>({
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String // Local cache for offline access
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileCategory: {
    type: String,
    enum: ['Images', 'PDFs', 'Sheets', 'Docs', 'Others'],
    required: true
  },
  
  // Google Drive fields
  googleDriveId: {
    type: String // File ID in Google Drive
  },
  googleDriveFolderId: {
    type: String // Parent folder ID
  },
  driveFileUrl: {
    type: String // Direct access URL
  },
  
  // Offline support
  isAvailableOffline: {
    type: Boolean,
    default: true
  },
  lastSyncAt: {
    type: Date
  },
  syncStatus: {
    type: String,
    enum: ['synced', 'pending', 'failed'],
    default: 'pending'
  },
  
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

export const File = mongoose.model<IFile>('File', fileSchema);