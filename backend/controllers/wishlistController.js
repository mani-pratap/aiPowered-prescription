import Wishlist from '../models/Wishlist.js';

// @desc    Toggle wishlist item
// @route   POST /api/wishlist
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const { medicineId } = req.body;

    const existing = await Wishlist.findOne({ user: req.user._id, medicine: medicineId });

    if (existing) {
      await existing.deleteOne();
      res.json({ message: 'Removed from wishlist', added: false });
    } else {
      await Wishlist.create({
        user: req.user._id,
        medicine: medicineId,
      });
      res.status(201).json({ message: 'Added to wishlist', added: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user._id }).populate('medicine');
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
