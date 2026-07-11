import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import medicineService from '../../services/medicineService';
import Pagination from '../ui/Pagination';

const MedicineTable = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [keyword, setKeyword] = useState('');

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const data = await medicineService.getMedicines({ page, limit: 10, keyword });
      setMedicines(data.medicines);
      setPages(data.pages);
      setPage(data.page);
    } catch (err) {
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [page, keyword]);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await medicineService.deleteMedicine(id);
        toast.success('Medicine deleted successfully');
        fetchMedicines();
      } catch (err) {
        toast.error('Failed to delete medicine');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <input 
          type="text" 
          placeholder="Search medicines..." 
          className="bg-slate-900 border border-slate-700 text-slate-100 px-4 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
        />
        <Link 
          to="/admin/medicines/add"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
        >
          Add Medicine
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading medicines...</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800 text-slate-200 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {medicines.map((med) => (
                  <tr key={med._id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono">{med._id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 font-medium text-slate-100">{med.medicineName}</td>
                    <td className="px-6 py-4">{med.category}</td>
                    <td className="px-6 py-4">{med.manufacturer}</td>
                    <td className="px-6 py-4">₹{med.price}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <Link 
                        to={`/admin/medicines/edit/${med._id}`}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => deleteHandler(med._id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {medicines.length === 0 && (
            <div className="p-6 text-center text-slate-500">No medicines found.</div>
          )}
        </div>
      )}
      
      <Pagination pages={pages} page={page} changePage={setPage} />
    </div>
  );
};

export default MedicineTable;
