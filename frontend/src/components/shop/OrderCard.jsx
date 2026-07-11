import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderCard = ({ order }) => {
  
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pending': return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'Confirmed': return { icon: CheckCircle, color: 'text-indigo-400', bg: 'bg-indigo-500/10' };
      case 'Packed': return { icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10' };
      case 'Out for Delivery': return { icon: Truck, color: 'text-purple-400', bg: 'bg-purple-500/10' };
      case 'Delivered': return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'Cancelled': return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' };
      default: return { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-800' };
    }
  };

  const config = getStatusConfig(order.orderStatus);
  const StatusIcon = config.icon;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center">
            {order.orderNumber}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className={`mt-3 sm:mt-0 px-4 py-2 rounded-lg flex items-center font-semibold text-sm ${config.bg} ${config.color}`}>
          <StatusIcon className="w-4 h-4 mr-2" />
          {order.orderStatus}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {order.orderItems.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-sm">
            <div className="flex items-center text-slate-300">
              <span className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-slate-400 mr-3">
                {item.quantity}x
              </span>
              <span className="font-medium">{item.name}</span>
            </div>
            <span className="font-bold text-slate-200">₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="text-slate-400 text-sm mb-4 sm:mb-0">
          Total Amount: <span className="text-xl font-black text-emerald-400 ml-2">₹{order.finalAmount.toFixed(2)}</span>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          {/* We will just link back to the success page as an invoice view for simplicity */}
          <Link 
            to={`/order-success/${order._id}`}
            className="flex-1 sm:flex-none text-center px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors text-sm"
          >
            View Invoice
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
