import express from 'express';
import { protect } from '../middleware/auth';
import { 
  getSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject 
} from '../controllers/subjectController';
import { 
  createSubjectValidation, 
  updateSubjectValidation,
  deleteSubjectValidation 
} from '../validation/subjectValidation';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Subject routes
router.get('/', getSubjects);
router.post(
  '/',
  createSubjectValidation,
  createSubject
);
router.put(
  '/:id',
  updateSubjectValidation,
  updateSubject
);
router.delete(
  '/:id',
  deleteSubjectValidation,
  deleteSubject
);

export default router;