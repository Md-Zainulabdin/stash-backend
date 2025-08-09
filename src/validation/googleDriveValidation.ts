import { body } from 'express-validator';

export const connectGoogleDriveValidation = [
  body('code')
    .notEmpty()
    .withMessage('Authorization code is required')
    .isString()
    .withMessage('Authorization code must be a string')
];