import { useState, useEffect } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import wishlistService from '../services/wishlistService';
import ShopMedicineCard from '../components/shop/ShopMedicineCard';

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      setWishlistItems(data);
    } catch (error) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-black text-white flex items-center">
          <Heart className="w-8 h-8 mr-3 text-rose-500" />
          My Wishlist
        </h1>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-2xl mx-auto">
          <Heart className="w-20 h-20 mx-auto text-slate-700 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Your wishlist is empty</h2>
          <p className="text-slate-400 mb-8">Save items you like to your wishlist to easily find them later.</p>
          <Link to="/store" className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25">
            Browse Medicines
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            item.medicine && (
              <ShopMedicineCard 
                key={item._id} 
                medicine={item.medicine} 
                onWishlistUpdate={fetchWishlist}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
