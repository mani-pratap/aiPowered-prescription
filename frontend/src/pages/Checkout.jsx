import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import cartService from '../services/cartService';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
  });

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await cartService.getCart();
        if (data.length === 0) {
          navigate('/cart');
        }
        setCartItems(data);
      } catch (error) {
        toast.error('Failed to load cart for checkout');
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const subtotal = cartItems.reduce((acc, item) => acc + (item.medicine?.mrp || 0) * item.quantity, 0);
    const finalAmount = cartItems.reduce((acc, item) => acc + (item.medicine?.price || 0) * item.quantity, 0);
    const discount = subtotal - finalAmount;

    const orderItems = cartItems.map(item => ({
      medicine: item.medicine._id,
      name: item.medicine.medicineName,
      quantity: item.quantity,
      price: item.medicine.price,
    }));

    try {
      const orderData = {
        orderItems,
        deliveryAddress: address,
        subtotal,
        discount,
        finalAmount,
      };

      const res = await orderService.createOrder(orderData);
      toast.success('Order placed successfully!');
      navigate(`/order-success/${res._id}`);
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  const finalAmount = cartItems.reduce((acc, item) => acc + (item.medicine?.price || 0) * item.quantity, 0);

  if (loading) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-black text-white">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-indigo-400" />
              Delivery Address
            </h2>
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
                  <input required type="text" name="fullName" value={address.fullName} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Phone Number</label>
                  <input required type="text" name="phone" value={address.phone} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Address Line 1</label>
                <input required type="text" name="addressLine1" value={address.addressLine1} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Address Line 2 (Optional)</label>
                <input type="text" name="addressLine2" value={address.addressLine2} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">City</label>
                  <input required type="text" name="city" value={address.city} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">State</label>
                  <input required type="text" name="state" value={address.state} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">PIN Code</label>
                  <input required type="text" name="postalCode" value={address.postalCode} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-4">Payment & Summary</h3>
            
            <div className="mb-6 p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 flex items-start">
              <CreditCard className="w-6 h-6 text-indigo-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-white text-sm">Dummy Payment Active</h4>
                <p className="text-xs text-indigo-200 mt-1">This is a demonstration system. No real payment will be processed. Clicking place order will simulate a successful transaction.</p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-white">Amount to Pay</span>
                <span className="text-2xl font-black text-emerald-400">₹{finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={isProcessing}
              className="w-full flex items-center justify-center py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30 text-lg disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
