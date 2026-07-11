import express from 'express';
import {
  generateAnalysis,
  getAnalysis,
  deleteAnalysis,
} from '../controllers/diseaseAnalysisController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:prescriptionId')
  .post(protect, generateAnalysis)
  .get(protect, getAnalysis);

router.route('/entry/:id')
  .delete(protect, deleteAnalysis);

export default router;
