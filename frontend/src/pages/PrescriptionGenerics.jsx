import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import genericService from '../services/genericService';
import ShopMedicineCard from '../components/shop/ShopMedicineCard';
import { Zap, IndianRupee, Loader2 } from 'lucide-react';

const PrescriptionGenerics = () => {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [medicineResults, setMedicineResults] = useState([]);
  const [totalSavings, setTotalSavings] = useState({ brandPrice: 0, genericPrice: 0 });

  useEffect(() => {
    const fetchPrescriptionAndGenerics = async () => {
      try {
        setLoading(true);
        // 1. Fetch prescription
        const res = await api.get(`/prescription/${prescriptionId}`);
        const prescription = res.data.data;
        const meds = prescription?.structuredData?.medicines || [];

        if (meds.length === 0) {
          setLoading(false);
          return;
        }

        // 2. Fetch generic alternatives for each medicine
        const promises = meds.map(async (med) => {
          try {
            const data = await genericService.getGenericAlternatives(med.medicineName);
            return data;
          } catch (err) {
            // If one fails (not found), just return null for that one
            return null;
          }
        });

        const results = await Promise.all(promises);
        const validResults = results.filter(Boolean);
        
        setMedicineResults(validResults);

        // 3. Calculate total optimal savings
        let bPrice = 0;
        let gPrice = 0;
        
        validResults.forEach(res => {
          bPrice += res.targetMedicine.price;
          // Pick cheapest alternative, or if none, fallback to brand price
          if (res.alternatives.length > 0) {
            gPrice += res.alternatives[0].price; // already sorted by cheapest
          } else {
            gPrice += res.targetMedicine.price;
          }
        });

        setTotalSavings({ brandPrice: bPrice, genericPrice: gPrice });

      } catch (error) {
        toast.error('Failed to load prescription generics');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptionAndGenerics();
  }, [prescriptionId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 flex justify-center items-center h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <Loader2 className="w-16 h-16 text-amber-500 animate-spin mb-4" />
          <p className="text-slate-400">Finding cheaper generic alternatives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-slate-100">Analysis Dashboard</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 mb-8 max-w-lg">
        <Link 
          to={`/disease-analysis/${prescriptionId}`} 
          className="flex-1 text-center py-2 text-slate-400 hover:text-slate-200 rounded-md text-sm font-medium transition-colors"
        >
          Disease Prediction
        </Link>
        <Link 
          to={`/disease-analysis/${prescriptionId}/diet`} 
          className="flex-1 text-center py-2 text-slate-400 hover:text-slate-200 rounded-md text-sm font-medium transition-colors"
        >
          Diet & Lifestyle
        </Link>
        <Link 
          to={`/disease-analysis/${prescriptionId}/generics`} 
          className="flex-1 text-center py-2 bg-indigo-600 text-white rounded-md text-sm font-medium shadow"
        >
          Generic Alternatives
        </Link>
      </div>

      <div className="bg-slate-950 p-2 sm:p-4 rounded-2xl">
        <div className="flex items-center mb-8">
          <Zap className="w-8 h-8 text-amber-400 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-white">Prescription Generics</h2>
            <p className="text-slate-400">Save money by choosing generic equivalents with the exact same chemical composition.</p>
          </div>
        </div>

        {medicineResults.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800">
            <p className="text-slate-400">No generic alternatives could be found for the medicines in this prescription.</p>
          </div>
        ) : (
          <>
            {/* Total Savings Card */}
            {totalSavings.brandPrice > totalSavings.genericPrice && (
              <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 mb-10 flex justify-between items-center shadow-lg">
                <div>
                  <h3 className="text-emerald-400 font-bold mb-1">Total Potential Savings</h3>
                  <p className="text-slate-300 text-sm">If you switch all branded medicines to cheapest generics</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400 line-through">Brand: ₹{totalSavings.brandPrice.toFixed(2)}</p>
                  <p className="text-3xl font-black text-emerald-400">
                    Save ₹{(totalSavings.brandPrice - totalSavings.genericPrice).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* List of Medicines */}
            <div className="space-y-12">
              {medicineResults.map((res, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-rose-400 bg-rose-400/10 px-3 py-1 rounded-full mb-2 inline-block">
                        Prescribed Brand
                      </span>
                      <h3 className="text-xl font-bold text-white">{res.targetMedicine.medicineName}</h3>
                      <p className="text-slate-400 text-sm mt-1">{res.targetMedicine.composition}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-sm text-slate-400 mb-1">Brand Price</span>
                      <span className="text-2xl font-black text-rose-400">₹{res.targetMedicine.price}</span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-slate-300 mb-4 flex items-center">
                    Generic Alternatives 
                    <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md ml-2 text-xs">
                      {res.alternatives.length} Found
                    </span>
                  </h4>

                  {res.alternatives.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">No alternatives found in database.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {res.alternatives.map(alt => (
                        <div key={alt._id} className="relative">
                          {alt.comparison.savings > 0 && (
                            <div className="absolute -top-3 -right-3 z-10 bg-emerald-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-lg shadow-emerald-500/30">
                              Save {alt.comparison.savingsPercentage}%
                            </div>
                          )}
                          <ShopMedicineCard medicine={alt} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PrescriptionGenerics;
