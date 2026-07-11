import express from 'express';
import {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  searchMedicines,
  getMedicinesByCategory,
  getMedicinesByGenericName
} from '../controllers/medicineController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getMedicines)
  .post(protect, createMedicine); // Protected per requirements, no strict admin check to avoid auth modification

router.get('/search', searchMedicines);
router.get('/category/:category', getMedicinesByCategory);
router.get('/generic/:medicineName', getMedicinesByGenericName);

router.route('/:id')
  .get(getMedicineById)
  .put(protect, updateMedicine) // Protected per requirements
  .delete(protect, deleteMedicine); // Protected per requirements

export default router;
