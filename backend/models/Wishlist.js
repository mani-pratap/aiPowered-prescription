import mongoose from 'mongoose';

const wishlistSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Medicine',
    },
  },
  {
    timestamps: true,
  }
);

wishlistSchema.index({ user: 1, medicine: 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
