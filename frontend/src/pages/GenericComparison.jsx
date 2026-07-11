import { useState, useEffect } from 'react';
import { Search, Zap, IndianRupee, Pill } from 'lucide-react';
import genericService from '../services/genericService';
import ShopMedicineCard from '../components/shop/ShopMedicineCard';
import { toast } from 'react-toastify';

const GenericComparison = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const data = await genericService.getGenericAlternatives(searchQuery);
      setResults(data);
    } catch (error) {
      toast.error('Medicine not found or no alternatives available');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-white mb-4 flex items-center justify-center">
          <Zap className="w-10 h-10 mr-3 text-amber-400" />
          Generic Medicine Finder
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Search for your expensive branded medicine and discover high-quality generic alternatives to save money on your treatment.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-16">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter brand medicine name (e.g. Crocin, Dolo)..."
            className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl pl-14 pr-4 py-5 text-lg text-white focus:outline-none focus:border-amber-400 transition-colors shadow-xl"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Find Generics'}
          </button>
        </form>
      </div>

      {results && (
        <div className="animate-fade-in-up">
          {/* Target Medicine Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between shadow-xl">
            <div>
              <span className="text-xs font-bold text-rose-400 bg-rose-400/10 px-3 py-1 rounded-full mb-3 inline-block uppercase tracking-wider">
                Searched Brand
              </span>
              <h2 className="text-3xl font-black text-white mb-2">{results.targetMedicine.medicineName}</h2>
              <p className="text-slate-400 mb-4">{results.targetMedicine.composition}</p>
              <div className="flex items-center text-sm font-semibold text-slate-300">
                <Pill className="w-4 h-4 mr-2" />
                {results.targetMedicine.manufacturer}
              </div>
            </div>
            <div className="mt-6 md:mt-0 text-center md:text-right bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <p className="text-sm text-slate-400 mb-1 font-semibold">Brand Price</p>
              <div className="text-4xl font-black text-rose-400 flex items-center justify-center md:justify-end">
                <IndianRupee className="w-8 h-8 mr-1" />
                {results.targetMedicine.price}
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-8 border-b border-slate-800 pb-4">
            Available Generic Alternatives <span className="text-amber-400 ml-2">({results.alternatives.length})</span>
          </h3>

          {results.alternatives.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800">
              <p className="text-slate-400">No generic alternatives found for this medicine in our database.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.alternatives.map((alt) => (
                <div key={alt._id} className="relative">
                  {/* Savings Badge */}
                  {alt.comparison.savings > 0 && (
                    <div className="absolute -top-4 -right-4 z-10 bg-emerald-500 text-white font-black text-sm px-4 py-2 rounded-full shadow-lg shadow-emerald-500/30 transform rotate-3">
                      Save {alt.comparison.savingsPercentage}%
                    </div>
                  )}
                  <ShopMedicineCard medicine={alt} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GenericComparison;
