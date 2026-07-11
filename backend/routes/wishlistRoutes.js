import express from 'express';
import { toggleWishlist, getWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, toggleWishlist)
  .get(protect, getWishlist);

export default router;
