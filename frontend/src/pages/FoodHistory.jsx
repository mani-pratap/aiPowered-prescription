import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import foodAnalysisService from '../services/foodAnalysisService';

const FoodHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await foodAnalysisService.getFoodHistory();
      setHistory(data);
    } catch (error) {
      toast.error('Failed to load food history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food analysis record?')) return;
    try {
      await foodAnalysisService.deleteFoodAnalysis(id);
      toast.success('Record deleted');
      setHistory(history.filter(item => item._id !== id));
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center">
            <Camera className="w-8 h-8 mr-3 text-emerald-400" />
            Food Analysis History
          </h1>
          <p className="text-slate-400 mt-2">Track what you eat and its impact on your health.</p>
        </div>
        <Link 
          to="/food-scanner"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/25 flex items-center"
        >
          Scan New Food
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center">
          <Camera className="w-20 h-20 mx-auto text-slate-700 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">No foods scanned yet</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Take photos of your meals and snacks to see if they are safe for your current medical condition.
          </p>
          <Link to="/food-scanner" className="inline-block px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all">
            Open Food Scanner
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <div key={item._id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-colors group flex flex-col">
              <div className="h-48 relative overflow-hidden bg-black">
                <img 
                  src={item.imageUrl} 
                  alt={item.foodName} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    item.recommendation === 'Eat' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.recommendation === 'Eat in Moderation' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {item.recommendation}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{item.foodName}</h3>
                <p className="text-sm text-slate-400 mb-4">{new Date(item.createdAt).toLocaleDateString()}</p>
                <p className="text-sm text-slate-300 line-clamp-2 mb-6 flex-grow">{item.reason}</p>
                
                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                  <Link 
                    to={`/food-result/${item._id}`}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors"
                  >
                    View Details
                  </Link>
                  <button 
                    onClick={() => handleDelete(item._id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-2 rounded-lg hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodHistory;
