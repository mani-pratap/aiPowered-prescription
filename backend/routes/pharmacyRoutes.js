import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { geocodePrescriptionAddress, getNearbyPharmacies } from '../controllers/pharmacyController.js';

const router = express.Router();

router.route('/nearby').get(protect, getNearbyPharmacies);
router.route('/geocode').post(protect, geocodePrescriptionAddress);

export default router;
