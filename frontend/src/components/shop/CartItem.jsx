import { Minus, Plus, Trash2 } from 'lucide-react';

const CartItem = ({ item, onUpdate, onRemove }) => {
  const medicine = item.medicine;

  if (!medicine) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl gap-4 hover:border-slate-700 transition-colors">
      <div className="flex-1 min-w-0 w-full">
        <h4 className="text-lg font-bold text-slate-100 truncate">{medicine.medicineName}</h4>
        <p className="text-sm text-slate-400 truncate">{medicine.manufacturer}</p>
        <p className="text-sm text-slate-500 mt-1">{medicine.packaging}</p>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto gap-6">
        <div className="text-lg font-bold text-emerald-400 w-24 text-right">
          ₹{(medicine.price * item.quantity).toFixed(2)}
        </div>

        <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800">
          <button 
            onClick={() => onUpdate(item._id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center font-semibold text-slate-200">{item.quantity}</span>
          <button 
            onClick={() => onUpdate(item._id, item.quantity + 1)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button 
          onClick={() => onRemove(item._id)}
          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
