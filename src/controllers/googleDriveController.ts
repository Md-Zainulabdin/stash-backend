import { Request, Response } from 'express';
import { User } from '../models/User';
import { Subject } from '../models/Subject';
import { File } from '../models/File';
import { asyncHandler } from '../utils/asyncHandler';
import { 
  getGoogleAuthUrl, 
  getTokensFromCode, 
  getDriveService,
  createDriveFolderStructure 
} from '../config/googleDrive';

// Step 1: Get Google OAuth URL
export const getGoogleDriveAuthUrl = asyncHandler(async (req: Request, res: Response) => {
  const authUrl = getGoogleAuthUrl();
  
  res.json({
    success: true,
    message: 'Google Drive authorization URL generated',
    data: { authUrl }
  });
});

// Step 2: Handle OAuth callback and connect Google Drive
export const connectGoogleDrive = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body;
  const userId = (req as any).user.userId;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Authorization code is required'
    });
  }

  try {
    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);
    
    // Create main "Stash" folder in user's Google Drive
    const driveService = getDriveService(tokens.access_token!, tokens.refresh_token!);
    
    const stashFolder = await driveService.files.create({
      requestBody: {
        name: 'Stash - Study Materials',
        mimeType: 'application/vnd.google-apps.folder'
      }
    });

    // Update user with Google Drive info
    await User.findByIdAndUpdate(userId, {
      'googleDrive.isConnected': true,
      'googleDrive.accessToken': tokens.access_token,
      'googleDrive.refreshToken': tokens.refresh_token,
      'googleDrive.connectedAt': new Date(),
      'googleDrive.rootFolderId': stashFolder.data.id
    });

    res.json({
      success: true,
      message: 'Google Drive connected successfully!',
      data: {
        folderName: 'Stash - Study Materials',
        folderId: stashFolder.data.id
      }
    });

  } catch (error) {
    console.error('Google Drive connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect Google Drive'
    });
  }
});

// Check Google Drive connection status
export const getGoogleDriveStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  const user = await User.findById(userId).select('googleDrive.isConnected googleDrive.connectedAt googleDrive.lastSyncAt');

  res.json({
    success: true,
    data: {
      isConnected: user?.googleDrive?.isConnected || false,
      connectedAt: user?.googleDrive?.connectedAt,
      lastSyncAt: user?.googleDrive?.lastSyncAt
    }
  });
});

// Disconnect Google Drive
export const disconnectGoogleDrive = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  await User.findByIdAndUpdate(userId, {
    'googleDrive.isConnected': false,
    'googleDrive.accessToken': undefined,
    'googleDrive.refreshToken': undefined,
    'googleDrive.rootFolderId': undefined
  });

  res.json({
    success: true,
    message: 'Google Drive disconnected successfully'
  });
});

// Sync files from Google Drive (for offline access)
export const syncFromGoogleDrive = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  const user = await User.findById(userId).select('+googleDrive.accessToken +googleDrive.refreshToken googleDrive.rootFolderId');
  
  if (!user?.googleDrive?.isConnected) {
    return res.status(400).json({
      success: false,
      message: 'Google Drive not connected'
    });
  }

  try {
    const driveService = getDriveService(
      user.googleDrive.accessToken!, 
      user.googleDrive.refreshToken!
    );

    // Get all files from Google Drive
    const response = await driveService.files.list({
      q: `'${user.googleDrive.rootFolderId}' in parents`,
      fields: 'files(id, name, mimeType, size, parents, createdTime)'
    });

    const driveFiles = response.data.files || [];
    let syncedCount = 0;

    // Update sync status for files
    for (const driveFile of driveFiles) {
      await File.updateMany(
        { googleDriveId: driveFile.id, userId },
        { 
          syncStatus: 'synced',
          lastSyncAt: new Date()
        }
      );
      syncedCount++;
    }

    // Update user's last sync time
    await User.findByIdAndUpdate(userId, {
      'googleDrive.lastSyncAt': new Date()
    });

    res.json({
      success: true,
      message: 'Files synced successfully',
      data: { syncedCount }
    });

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync files'
    });
  }
});