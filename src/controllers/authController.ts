import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

// Register new user
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // Simple validation
  if (!name || !email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Please provide name, email, and password' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      success: false,
      message: 'Password must be at least 6 characters long' 
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ 
      success: false,
      message: 'User with this email already exists' 
    });
  }

  // Create new user
  const user = new User({ name, email, password });
  await user.save();

  // Create JWT token
  const token = jwt.sign(
    { userId: user._id }, 
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );

  res.status(201).json({
    success: true,
    message: 'User registered successfully!',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    }
  });
});

// Login user
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Please provide email and password' 
    });
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid email or password' 
    });
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid email or password' 
    });
  }

  // Create JWT token
  const token = jwt.sign(
    { userId: user._id }, 
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    message: 'Login successful!',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    }
  });
});