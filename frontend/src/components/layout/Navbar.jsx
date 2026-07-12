import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, LogOut, ShoppingCart } from 'lucide-react';
import cartService from '../../services/cartService';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    if (user) {
      try {
        const cart = await cartService.getCart();
        const count = cart.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
      } catch (error) {
        console.error("Failed to fetch cart count", error);
      }
    }
  };

  useEffect(() => {
    fetchCartCount();

    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [user]);

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-indigo-500/20 p-2 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
              <Stethoscope className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ArogyaSaathi
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/upload"
                  className="text-slate-300 hover:text-white font-medium transition-colors hidden sm:block"
                >
                  Upload
                </Link>
                <Link
                  to="/store"
                  className="text-slate-300 hover:text-white font-medium transition-colors hidden sm:block"
                >
                  Store
                </Link>
                <Link
                  to="/cart"
                  className="relative text-slate-300 hover:text-white transition-colors p-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
                >
                  {user?.profileImage && !user.profileImage.includes('anonymous-avatar-icon') ? (
                    <img
                      src={user.profileImage}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full border border-indigo-500/50 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-indigo-500/50 bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline-block font-medium">{user.fullName}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/25"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
