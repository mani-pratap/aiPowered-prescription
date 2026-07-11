import { useState, useEffect } from 'react';
import { ShoppingCart, Search, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import cartService from '../services/cartService';
import CartItem from '../components/shop/CartItem';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCartItems(data);
    } catch (error) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, quantity) => {
    try {
      await cartService.updateCartItem(id, quantity);
      fetchCart();
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const handleRemove = async (id) => {
    try {
      await cartService.removeFromCart(id);
      fetchCart();
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const subtotal = cartItems.reduce((acc, item) => {
    return acc + (item.medicine?.price || 0) * item.quantity;
  }, 0);

  const mrpTotal = cartItems.reduce((acc, item) => {
    return acc + (item.medicine?.mrp || 0) * item.quantity;
  }, 0);

  const discount = mrpTotal - subtotal;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-black text-white flex items-center">
          <ShoppingCart className="w-8 h-8 mr-3 text-indigo-500" />
          Your Cart
        </h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
          <ShoppingCart className="w-20 h-20 mx-auto text-slate-700 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
          <p className="text-slate-400 mb-8">Looks like you haven't added any medicines yet.</p>
          <Link to="/store" className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25">
            Browse Store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <CartItem 
                key={item._id} 
                item={item} 
                onUpdate={handleUpdate} 
                onRemove={handleRemove} 
              />
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-4">Order Summary</h3>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-slate-400">
                  <span>Total MRP</span>
                  <span className="line-through">₹{mrpTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Total Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery Charges</span>
                  <span className="text-emerald-400 font-medium">FREE</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-white">Total Amount</span>
                  <span className="text-2xl font-black text-indigo-400">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <p className="text-xs text-emerald-500 font-semibold mt-2 text-right">
                    You will save ₹{discount.toFixed(2)} on this order
                  </p>
                )}
              </div>

              <Link 
                to="/checkout"
                className="w-full flex items-center justify-center py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30 text-lg"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
