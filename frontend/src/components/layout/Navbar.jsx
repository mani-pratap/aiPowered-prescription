import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, LogOut, ShoppingCart, Camera, MapPin, Bell, CheckCircle } from 'lucide-react';
import cartService from '../../services/cartService';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState({ missed: [], upcoming: [] });

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

  const calculateNotifications = () => {
    if (!user || !user.medicineSchedule) return;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMinute;

    const missed = [];
    const upcoming = [];

    user.medicineSchedule.forEach(med => {
      if (med.status !== 'active') return;
      if (!med.reminderTimes || med.reminderTimes.length === 0) return;

      med.reminderTimes.forEach(timeStr => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const timeVal = hours * 60 + minutes;
        
        const notifItem = {
          id: `${med._id}-${timeStr}`,
          medicineName: med.medicineName,
          time: timeStr
        };

        if (timeVal < currentTimeVal) {
          missed.push(notifItem);
        } else {
          upcoming.push(notifItem);
        }
      });
    });

    setNotifications({ missed, upcoming });
  };

  useEffect(() => {
    fetchCartCount();
    calculateNotifications();

    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Check notifications every minute
    const notifInterval = setInterval(calculateNotifications, 60000);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      clearInterval(notifInterval);
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
                  className="text-slate-300 hover:text-white font-medium transition-colors hidden sm:flex items-center space-x-1"
                >
                  <Camera className="w-4 h-4" />
                  <span>Upload Rx</span>
                </Link>
                <Link
                  to="/history"
                  className="text-slate-300 hover:text-white font-medium transition-colors hidden sm:block"
                >
                  History
                </Link>
                <Link
                  to="/food-scanner"
                  className="text-pink-400 hover:text-pink-300 font-medium transition-colors hidden sm:flex items-center space-x-1"
                >
                  <Camera className="w-4 h-4" />
                  <span>Food Scanner</span>
                </Link>
                <Link
                  to="/pharmacies"
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors hidden sm:flex items-center space-x-1"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Pharmacies</span>
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

                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative text-slate-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                  >
                    <Bell className="w-5 h-5" />
                    {(notifications.missed.length > 0 || notifications.upcoming.length > 0) && (
                      <span className="absolute top-1 right-1 inline-flex items-center justify-center w-2 h-2 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-purple-500 rounded-full animate-pulse">
                      </span>
                    )}
                  </button>

                  {isNotificationOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-white/10 bg-slate-800/50">
                          <h3 className="font-bold text-white flex items-center">
                            <Bell className="w-4 h-4 mr-2 text-purple-400" /> Reminders Today
                          </h3>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.missed.length === 0 && notifications.upcoming.length === 0 ? (
                            <div className="p-6 text-center text-slate-400 flex flex-col items-center">
                              <CheckCircle className="w-8 h-8 text-emerald-500/50 mb-2" />
                              <p className="text-sm">No active reminders today!</p>
                            </div>
                          ) : (
                            <div className="p-2 space-y-4">
                              {notifications.missed.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider px-2 mb-2">Missed</h4>
                                  <div className="space-y-1">
                                    {notifications.missed.map(notif => (
                                      <div key={notif.id} className="flex items-center justify-between p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <div className="flex items-center">
                                          <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                                          <span className="text-sm text-slate-200">{notif.medicineName}</span>
                                        </div>
                                        <span className="text-xs font-mono text-red-300">{notif.time}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {notifications.upcoming.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider px-2 mb-2">Upcoming</h4>
                                  <div className="space-y-1">
                                    {notifications.upcoming.map(notif => (
                                      <div key={notif.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                        <div className="flex items-center">
                                          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                                          <span className="text-sm text-slate-200">{notif.medicineName}</span>
                                        </div>
                                        <span className="text-xs font-mono text-emerald-300">{notif.time}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="p-3 border-t border-white/10 bg-slate-800/50">
                          <Link 
                            to="/profile" 
                            onClick={() => setIsNotificationOpen(false)}
                            className="block w-full text-center text-sm text-indigo-400 hover:text-indigo-300 font-medium py-1"
                          >
                            Manage Reminder Times
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
                >
                  {user?.profileImage && !user.profileImage.includes('anonymous-avatar-icon') ? (
                    <div className="relative">
                      <img
                        src={user.profileImage}
                        alt={user.fullName}
                        className="w-8 h-8 rounded-full border border-indigo-500/50 object-cover"
                      />
                      {user?.patientType === 'regular' && (
                        <div className="absolute -top-1 -right-1 bg-gradient-to-br from-purple-500 to-indigo-600 w-3.5 h-3.5 rounded-full border border-slate-950 flex items-center justify-center shadow-sm z-10" title="Regular Medicine User">
                          <span className="text-white text-[9px] font-bold leading-none mt-[1px]">R</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full border border-indigo-500/50 bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        {user?.fullName?.charAt(0).toUpperCase()}
                      </div>
                      {user?.patientType === 'regular' && (
                        <div className="absolute -top-1 -right-1 bg-gradient-to-br from-purple-500 to-indigo-600 w-3.5 h-3.5 rounded-full border border-slate-950 flex items-center justify-center shadow-sm z-10" title="Regular Medicine User">
                          <span className="text-white text-[9px] font-bold leading-none mt-[1px]">R</span>
                        </div>
                      )}
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
