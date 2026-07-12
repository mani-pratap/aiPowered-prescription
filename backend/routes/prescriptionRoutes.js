import express from 'express';
import {
  uploadPrescription,
  getPrescription,
  getPrescriptionHistory,
  deletePrescription,
  getPrescriptionGenerics,
} from '../controllers/prescriptionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protect, upload.single('image'), uploadPrescription);
router.get('/history', protect, getPrescriptionHistory);
router.get('/:id', protect, getPrescription);
router.get('/:id/generics', protect, getPrescriptionGenerics);
router.delete('/:id', protect, deletePrescription);

export default router;
