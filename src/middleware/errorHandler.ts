import { Request, Response, NextFunction } from 'express';

// Simple error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Something went wrong',
  });
};