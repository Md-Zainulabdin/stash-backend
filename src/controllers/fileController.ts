import { Request, Response } from 'express';
import { File } from '../models/File';
import { Subject } from '../models/Subject';
import { asyncHandler } from '../utils/asyncHandler';
import fs from 'fs';
import path from 'path';
import { User } from '../models/User';
import { getDriveService } from '../config/googleDrive';
// import mime from 'mime-types';

// Upload file
export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId } = req.body;
  const userId = req.user!.userId;
  const uploadedFiles = req.files as Express.Multer.File[];

  if (!uploadedFiles || uploadedFiles.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }

  if (!subjectId) {
    // Delete all uploaded files if subjectId is missing
    uploadedFiles.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error('Error deleting uploaded file:', error);
      }
    });
    return res.status(400).json({
      success: false,
      message: 'Subject ID is required'
    });
  }

  // Check if subject exists and belongs to user
  const subject = await Subject.findOne({ _id: subjectId, userId });
  if (!subject) {
    // Delete all uploaded files if subject doesn't exist
    uploadedFiles.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error('Error deleting uploaded file:', error);
      }
    });
    return res.status(404).json({
      success: false,
      message: 'Subject not found'
    });
  }

  // Save each file info to database
  const savedFiles = [];
  for (const file of uploadedFiles) {
    // Determine file category based on MIME type
    let fileCategory: 'Images' | 'PDFs' | 'Sheets' | 'Docs' | 'Others' = 'Others';
    if (file.mimetype.startsWith('image/')) {
      fileCategory = 'Images';
    } else if (file.mimetype === 'application/pdf') {
      fileCategory = 'PDFs';
    } else if (file.mimetype.includes('sheet') || file.mimetype.includes('csv') || file.mimetype.includes('excel')) {
      fileCategory = 'Sheets';
    } else if (file.mimetype.includes('document') || file.mimetype.includes('word') || file.mimetype === 'text/plain') {
      fileCategory = 'Docs';
    }

    const newFile = new File({
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      fileCategory,
      subjectId,
      userId
    });
    await newFile.save();

    // --- Google Drive Sync ---
    try {
      // Fetch user with Google Drive tokens and rootFolderId
      const user = await User.findById(userId).select('+googleDrive.accessToken +googleDrive.refreshToken googleDrive.rootFolderId googleDrive.isConnected');
      if (user?.googleDrive?.isConnected && user.googleDrive.accessToken && user.googleDrive.rootFolderId) {
        const driveService = getDriveService(user.googleDrive.accessToken, user.googleDrive.refreshToken);
        // 1. Check if subject folder exists in Google Drive under rootFolderId
        let subjectFolderId: string | undefined;
        const folderList = await driveService.files.list({
          q: `mimeType='application/vnd.google-apps.folder' and trashed=false and name='${subject.name}' and '${user.googleDrive.rootFolderId}' in parents`,
          fields: 'files(id, name)'
        });
        if (folderList.data.files && folderList.data.files.length > 0) {
          subjectFolderId = folderList.data.files[0].id ?? undefined;
        } else {
          // 2. Create subject folder if it doesn't exist
          const createdFolder = await driveService.files.create({
            requestBody: {
              name: subject.name,
              mimeType: 'application/vnd.google-apps.folder',
              parents: [user.googleDrive.rootFolderId]
            },
            fields: 'id'
          });
          subjectFolderId = createdFolder.data.id ?? undefined;
        }
        // 3. Upload file to subject folder
        const driveRes = await driveService.files.create({
          requestBody: {
            name: file.originalname,
            parents: subjectFolderId ? [subjectFolderId] : [user.googleDrive.rootFolderId],
            mimeType: file.mimetype
          },
          media: {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.path)
          },
          fields: 'id, webViewLink, parents'
        });
        // 4. Update File doc with Google Drive info
        newFile.googleDriveId = driveRes.data.id ?? undefined;
        newFile.googleDriveFolderId = subjectFolderId ?? undefined;
        newFile.driveFileUrl = driveRes.data.webViewLink ?? undefined;
        newFile.syncStatus = 'synced';
        await newFile.save();
      } else {
        newFile.syncStatus = 'failed';
        await newFile.save();
      }
    } catch (err) {
      newFile.syncStatus = 'failed';
      await newFile.save();
      console.error('Google Drive upload failed:', err);
    }
    // --- End Google Drive Sync ---

    savedFiles.push(newFile);
  }

  res.status(201).json({
    success: true,
    message: 'Files uploaded successfully',
    data: { files: savedFiles }
  });
});

// Get files for a subject
export const getSubjectFiles = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId } = req.params;
  const userId = req.user!.userId;

  // Check if subject belongs to user
  const subject = await Subject.findOne({ _id: subjectId, userId });
  if (!subject) {
    return res.status(404).json({
      success: false,
      message: 'Subject not found'
    });
  }

  const files = await File.find({ subjectId, userId }).sort({ uploadedAt: -1 });

  res.json({
    success: true,
    message: 'Files retrieved successfully',
    data: { files }
  });
});

// Get all files for user
export const getUserFiles = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const files = await File.find({ userId })
    .populate('subjectId', 'name code')
    .sort({ uploadedAt: -1 });

  res.json({
    success: true,
    message: 'Files retrieved successfully', 
    data: { files }
  });
});

// Download file
export const downloadFile = asyncHandler(async (req: Request, res: Response) => {
  const { fileId } = req.params;
  const userId = req.user!.userId;

  const file = await File.findOne({ _id: fileId, userId });
  if (!file) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  // Check if file exists on disk
  if (!file.filePath || !fs.existsSync(file.filePath)) {
    return res.status(404).json({
      success: false,
      message: 'File not found on server'
    });
  }

  // Set headers for download
  res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
  res.setHeader('Content-Type', file.mimeType);

  // Send file
  res.sendFile(path.resolve(file.filePath));
});

// Delete file
export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const { fileId } = req.params;
  const userId = req.user!.userId;

  const file = await File.findOne({ _id: fileId, userId });
  if (!file) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  // Delete file from disk
  if (file.filePath && fs.existsSync(file.filePath)) {
    try {
      fs.unlinkSync(file.filePath);
    } catch (error) {
      console.error('Error deleting file from disk:', error);
      // Continue with database deletion even if file deletion fails
    }
  }

  // Delete from database
  await File.findByIdAndDelete(fileId);

  res.json({
    success: true,
    message: 'File deleted successfully'
  });
});