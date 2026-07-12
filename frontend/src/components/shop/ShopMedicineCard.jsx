import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import cartService from '../../services/cartService';
import wishlistService from '../../services/wishlistService';
import { useAuth } from '../../context/AuthContext';

const ShopMedicineCard = ({ medicine, onWishlistUpdate, onDetailsClick }) => {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      toast.info('Please login to add items to cart');
      return;
    }
    
    setIsAdding(true);
    try {
      await cartService.addToCart(medicine._id, 1);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.info('Please login to save items');
      return;
    }

    setIsWishlisting(true);
    try {
      const res = await wishlistService.toggleWishlist(medicine._id);
      if (res.added) toast.success('Saved to wishlist');
      else toast.info('Removed from wishlist');
      if (onWishlistUpdate) onWishlistUpdate();
    } catch (error) {
      toast.error('Failed to update wishlist');
    } finally {
      setIsWishlisting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-all group flex flex-col h-full relative overflow-hidden shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-bold bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md mb-2 inline-block">
            {medicine.category || 'General'}
          </span>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
            {medicine.medicineName}
          </h3>
          <p className="text-sm text-slate-400 truncate">{medicine.manufacturer}</p>
        </div>
        <button 
          onClick={handleToggleWishlist}
          disabled={isWishlisting}
          className="text-slate-500 hover:text-rose-500 transition-colors p-2"
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4 flex-grow">
        <p className="text-sm text-slate-300 line-clamp-2">{medicine.composition}</p>
        <p className="text-xs text-slate-500 mt-2">{medicine.dosageForm} • {medicine.packaging}</p>
        {medicine.prescriptionRequired && (
          <div className="flex items-center text-xs font-semibold text-amber-500 mt-3 bg-amber-500/10 w-max px-2 py-1 rounded">
            <ShieldAlert className="w-3 h-3 mr-1" />
            Rx Required
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-slate-800 pt-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-2xl font-black text-white">₹{medicine.price}</span>
            {medicine.mrp > medicine.price && (
              <span className="text-sm text-slate-500 line-through ml-2">₹{medicine.mrp}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {onDetailsClick ? (
            <button
              onClick={() => onDetailsClick(medicine)}
              className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl font-semibold transition-colors text-sm"
            >
              Details
            </button>
          ) : (
            <Link 
              to={`/store/medicine/${medicine._id}`}
              className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl font-semibold transition-colors text-sm"
            >
              Details
            </Link>
          )}
          <button 
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25 text-sm disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4 mr-1.5" />
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopMedicineCard;
