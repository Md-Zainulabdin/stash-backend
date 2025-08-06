import { Request, Response } from 'express';
import { Subject } from '../models/Subject';
import { asyncHandler } from '../utils/asyncHandler';

// Get all subjects for user
export const getSubjects = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  
  const subjects = await Subject.find({ userId }).sort({ createdAt: -1 });
  
  res.json({
    success: true,
    message: 'Subjects retrieved successfully',
    data: { subjects }
  });
});

// Create new subject
export const createSubject = asyncHandler(async (req: Request, res: Response) => {
  const { name, code } = req.body;
  const userId = (req as any).user.userId;

  // Simple validation
  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Please provide subject name'
    });
  }

  // Check if subject already exists for this user
  const existingSubject = await Subject.findOne({ name, userId });
  if (existingSubject) {
    return res.status(400).json({
      success: false,
      message: 'Subject with this name already exists'
    });
  }

  // Create new subject
  const subject = new Subject({
    name,
    code,
    userId
  });

  await subject.save();

  res.status(201).json({
    success: true,
    message: 'Subject created successfully',
    data: { subject }
  });
});

// Update subject
export const updateSubject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, code } = req.body;
  const userId = (req as any).user.userId;

  const subject = await Subject.findOne({ _id: id, userId });
  if (!subject) {
    return res.status(404).json({
      success: false,
      message: 'Subject not found'
    });
  }

  // Update fields if provided
  if (name) subject.name = name;
  if (code !== undefined) subject.code = code;

  await subject.save();

  res.json({
    success: true,
    message: 'Subject updated successfully',
    data: { subject }
  });
});

// Delete subject
export const deleteSubject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.userId;

  const subject = await Subject.findOne({ _id: id, userId });
  if (!subject) {
    return res.status(404).json({
      success: false,
      message: 'Subject not found'
    });
  }

  await Subject.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Subject deleted successfully'
  });
});