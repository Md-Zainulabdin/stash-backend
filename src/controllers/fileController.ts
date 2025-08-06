import { Request, Response } from 'express';
import { File } from '../models/File';
import { Subject } from '../models/Subject';
import { asyncHandler } from '../utils/asyncHandler';
import fs from 'fs';
import path from 'path';

// Upload file
export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId } = req.body;
  const userId = (req as any).user.userId;
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
      fs.unlinkSync(file.path);
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
      fs.unlinkSync(file.path);
    });
    return res.status(404).json({
      success: false,
      message: 'Subject not found'
    });
  }

  // Save each file info to database
  const savedFiles = [];
  for (const file of uploadedFiles) {
    const newFile = new File({
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      subjectId,
      userId
    });
    await newFile.save();
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
  const userId = (req as any).user.userId;

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
  const userId = (req as any).user.userId;

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
  const userId = (req as any).user.userId;

  const file = await File.findOne({ _id: fileId, userId });
  if (!file) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  // Check if file exists on disk
  if (!fs.existsSync(file.filePath)) {
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
  const userId = (req as any).user.userId;

  const file = await File.findOne({ _id: fileId, userId });
  if (!file) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  // Delete file from disk
  if (fs.existsSync(file.filePath)) {
    fs.unlinkSync(file.filePath);
  }

  // Delete from database
  await File.findByIdAndDelete(fileId);

  res.json({
    success: true,
    message: 'File deleted successfully'
  });
});