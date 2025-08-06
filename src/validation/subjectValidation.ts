import { body, param } from 'express-validator';

export const createSubjectValidation = [
  body('name')
    .notEmpty()
    .withMessage('Subject name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Subject name must be between 1 and 100 characters')
    .trim()
    .escape(),
  body('code')
    .optional()
    .isString()
    .withMessage('Code must be a string')
    .isLength({ max: 20 })
    .withMessage('Code must be less than 20 characters')
    .trim()
    .escape()
];

export const updateSubjectValidation = [
  param('id')
    .notEmpty()
    .withMessage('Subject ID is required')
    .isMongoId()
    .withMessage('Invalid subject ID format'),
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Subject name must be between 1 and 100 characters')
    .trim()
    .escape(),
  body('code')
    .optional()
    .isString()
    .withMessage('Code must be a string')
    .isLength({ max: 20 })
    .withMessage('Code must be less than 20 characters')
    .trim()
    .escape()
];

export const deleteSubjectValidation = [
  param('id')
    .notEmpty()
    .withMessage('Subject ID is required')
    .isMongoId()
    .withMessage('Invalid subject ID format')
];