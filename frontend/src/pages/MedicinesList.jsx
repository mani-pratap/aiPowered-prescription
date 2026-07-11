import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import medicineService from '../services/medicineService';
import MedicineCard from '../components/medicine/MedicineCard';
import MedicineSearch from '../components/medicine/MedicineSearch';
import MedicineFilter from '../components/medicine/MedicineFilter';
import Pagination from '../components/ui/Pagination';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MedicinesList = () => {
  const { user } = useAuth(); // If we want to show admin buttons conditionally
  
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState({});

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const data = await medicineService.getMedicines({
        page,
        limit: 12,
        keyword,
        ...filters
      });
      setMedicines(data.medicines);
      setPages(data.pages);
      setPage(data.page);
    } catch (err) {
      setError('Failed to fetch medicines. Please try again later.');
      toast.error('Error fetching medicines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
    window.scrollTo(0, 0);
  }, [page, keyword, filters]);

  const handleSearch = (searchKeyword) => {
    setKeyword(searchKeyword);
    setPage(1); // Reset to page 1 on new search
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to page 1 on filter change
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Medicine Database</h1>
          <p className="text-slate-400 mt-1">Search and filter through our comprehensive medicine registry.</p>
        </div>
        
        {user && (
          <div className="flex gap-3">
            <Link 
              to="/admin/medicines"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium text-sm border border-slate-700"
            >
              Manage Database
            </Link>
            <Link 
              to="/admin/medicines/add"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium text-sm shadow-lg shadow-indigo-500/20"
            >
              + Add Medicine
            </Link>
          </div>
        )}
      </div>

      <MedicineSearch onSearch={handleSearch} />

      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        {/* Sidebar Filters */}
        <div className="lg:w-1/4 w-full">
          <MedicineFilter onFilterChange={handleFilterChange} />
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4 w-full">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : medicines.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-xl font-medium text-slate-300 mb-2">No Medicines Found</h3>
              <p className="text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
              {(keyword || Object.keys(filters).length > 0) && (
                <button 
                  onClick={() => { setKeyword(''); setFilters({}); }}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {medicines.map((medicine) => (
                  <MedicineCard key={medicine._id} medicine={medicine} />
                ))}
              </div>
              <Pagination pages={pages} page={page} changePage={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicinesList;
