import express from 'express';
import { getGenericAlternatives } from '../controllers/genericMedicineController.js';

const router = express.Router();

router.route('/:medicineName').get(getGenericAlternatives);

export default router;
