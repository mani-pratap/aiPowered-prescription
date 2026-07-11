import { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, PackageSearch } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import shopService from '../services/shopService';
import ShopMedicineCard from '../components/shop/ShopMedicineCard';

const MedicineStore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [rxRequired, setRxRequired] = useState(searchParams.get('rxRequired') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');

  const categories = [
    'All', 'Fever', 'Cold', 'Cough', 'Diabetes', 'Hypertension', 
    'Pain Relief', 'Antibiotics', 'Allergy', 'Asthma', 'Heart', 
    'Vitamin Supplements', 'Skin', 'Eye Drops', 'ENT', 'Digestive'
  ];

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (keyword) queryParams.append('keyword', keyword);
      if (category !== 'All') queryParams.append('category', category);
      if (rxRequired !== '') queryParams.append('rxRequired', rxRequired);
      if (sort) queryParams.append('sort', sort);

      const data = await shopService.getShopMedicines('?' + queryParams.toString());
      setMedicines(data.medicines);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
    // Update URL
    const params = {};
    if (keyword) params.keyword = keyword;
    if (category !== 'All') params.category = category;
    if (rxRequired !== '') params.rxRequired = rxRequired;
    if (sort) params.sort = sort;
    setSearchParams(params);
  }, [category, rxRequired, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMedicines();
    setSearchParams({ keyword, category, rxRequired, sort });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sticky top-24">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-indigo-400" />
            Filters
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-400 mb-3">Categories</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-400 mb-3">Prescription</label>
            <select
              value={rxRequired}
              onChange={(e) => setRxRequired(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Any</option>
              <option value="true">Required</option>
              <option value="false">Not Required (OTC)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-3">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search medicines by name, generic name, or composition..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-14 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-lg"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-500/20"
            >
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : medicines.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
            <PackageSearch className="w-20 h-20 mx-auto text-slate-700 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">No Medicines Found</h2>
            <p className="text-slate-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((med) => (
              <ShopMedicineCard key={med._id} medicine={med} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineStore;
