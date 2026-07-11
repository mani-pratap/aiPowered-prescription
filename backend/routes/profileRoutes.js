import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getReminders,
  updateReminders,
  addMedicine,
  updateMedicine,
  deleteMedicine,
} from '../controllers/profileController.js';

const router = express.Router();

router.route('/reminders')
  .get(protect, getReminders)
  .put(protect, updateReminders);

router.route('/medicine')
  .post(protect, addMedicine);

router.route('/medicine/:id')
  .put(protect, updateMedicine)
  .delete(protect, deleteMedicine);

export default router;
