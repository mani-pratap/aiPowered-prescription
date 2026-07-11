import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import {
  uploadAndAnalyzeFood,
  getFoodHistory,
  getFoodAnalysisDetails,
  deleteFoodAnalysis
} from '../controllers/foodAnalysisController.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

router.route('/')
  .post(protect, upload.single('image'), uploadAndAnalyzeFood)
  .get(protect, getFoodHistory);

router.route('/:id')
  .get(protect, getFoodAnalysisDetails)
  .delete(protect, deleteFoodAnalysis);

export default router;
