import express from 'express';
import { getShopMedicines, getShopMedicineById } from '../controllers/shopController.js';

const router = express.Router();

router.route('/medicines').get(getShopMedicines);
router.route('/medicine/:id').get(getShopMedicineById);

export default router;
