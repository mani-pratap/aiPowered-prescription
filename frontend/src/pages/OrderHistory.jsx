import { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import orderService from '../services/orderService';
import OrderCard from '../components/shop/OrderCard';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (error) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-black text-white flex items-center">
          <ShoppingBag className="w-8 h-8 mr-3 text-indigo-500" />
          Order History
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
          <ShoppingBag className="w-20 h-20 mx-auto text-slate-700 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">No orders yet</h2>
          <p className="text-slate-400">You haven't placed any orders.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
