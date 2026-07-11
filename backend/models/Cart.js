import mongoose from 'mongoose';

const cartSchema = mongoose.Schema(
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
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only have one cart item per medicine (we update quantity if it exists)
cartSchema.index({ user: 1, medicine: 1 }, { unique: true });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
