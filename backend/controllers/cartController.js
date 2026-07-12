import Cart from '../models/Cart.js';

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { medicineId, quantity = 1 } = req.body;

    let cartItem = await Cart.findOne({ user: req.user._id, medicine: medicineId });

    if (cartItem) {
      cartItem.quantity += Number(quantity);
      await cartItem.save();
    } else {
      cartItem = await Cart.create({
        user: req.user._id,
        medicine: medicineId,
        quantity: Number(quantity),
      });
    }

    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.find({ user: req.user._id }).populate('medicine');
    
    // Automatically clean up cart items where the medicine was deleted or doesn't exist
    const validCart = [];
    for (let item of cart) {
      if (!item.medicine) {
        await Cart.findByIdAndDelete(item._id);
      } else {
        validCart.push(item);
      }
    }

    res.json(validCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await Cart.findById(req.params.id);

    if (cartItem && cartItem.user.toString() === req.user._id.toString()) {
      if (quantity > 0) {
        cartItem.quantity = Number(quantity);
        await cartItem.save();
        res.json(cartItem);
      } else {
        await cartItem.deleteOne();
        res.json({ message: 'Item removed from cart' });
      }
    } else {
      res.status(404).json({ message: 'Cart item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const cartItem = await Cart.findById(req.params.id);

    if (cartItem && cartItem.user.toString() === req.user._id.toString()) {
      await cartItem.deleteOne();
      res.json({ message: 'Item removed from cart' });
    } else {
      res.status(404).json({ message: 'Cart item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({ user: req.user._id });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
