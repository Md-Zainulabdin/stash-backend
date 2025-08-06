import { body, param } from 'express-validator';

export const uploadFileValidation = [
  body('subjectId')
    .notEmpty()
    .withMessage('Subject ID is required')
    .isMongoId()
    .withMessage('Invalid subject ID format'),
];

export const getSubjectFilesValidation = [
  param('subjectId')
    .notEmpty()
    .withMessage('Subject ID is required')
    .isMongoId()
    .withMessage('Invalid subject ID format'),
];

export const downloadFileValidation = [
  param('fileId')
    .notEmpty()
    .withMessage('File ID is required')
    .isMongoId()
    .withMessage('Invalid file ID format'),
];

export const deleteFileValidation = [
  param('fileId')
    .notEmpty()
    .withMessage('File ID is required')
    .isMongoId()
    .withMessage('Invalid file ID format'),
]; 