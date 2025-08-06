import express from 'express';
import { register, login } from '../controllers/authController';
import { registerValidation, loginValidation } from '../validation/authValidation';

const router = express.Router();

// Auth routes
router.post(
  '/register',
  registerValidation,
  register
);
router.post(
  '/login',
  loginValidation,
  login
);

export default router;