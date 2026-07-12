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
  const [selectedMedicine, setSelectedMedicine] = useState(null);

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

        // 2. Fetch generic alternatives for the entire prescription
        // This will fetch from DB cache if available, or generate via AI and save it
        const genericsRes = await api.get(`/prescription/${prescriptionId}/generics`);
        const validResults = genericsRes.data.data;
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

            {/* List of Medicines in Horizontal Comparison Grid */}
            <div className="space-y-12">
              {medicineResults.map((res, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  
                  <h4 className="font-semibold text-slate-300 mb-6 flex items-center">
                    Brand & Generic Alternatives Comparison
                    <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md ml-2 text-xs">
                      {res.alternatives.length} Found
                    </span>
                  </h4>

                  {res.alternatives.length === 0 ? (
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                      <span className="text-xs font-bold text-rose-400 bg-rose-400/10 px-3 py-1 rounded-full mb-2 inline-block">Prescribed Brand</span>
                      <h3 className="text-xl font-bold text-white">{res.targetMedicine.medicineName}</h3>
                      <p className="text-slate-500 text-sm italic mt-4">No generic alternatives found in database for this medicine.</p>
                    </div>
                  ) : (
                    <div className="flex flex-row overflow-x-auto gap-6 pb-6 pt-2 snap-x hide-scrollbar">
                      
                      {/* Branded Card */}
                      <div className="min-w-[300px] w-[300px] flex-shrink-0 snap-center bg-slate-800 border-2 border-rose-500/30 rounded-2xl p-6 relative flex flex-col h-full shadow-lg">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-rose-400 rounded-t-2xl"></div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-xs font-bold text-rose-400 bg-rose-400/10 px-3 py-1 rounded-full inline-block">
                            Prescribed Brand
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{res.targetMedicine.medicineName}</h3>
                        <p className="text-slate-400 text-sm mb-4 flex-grow">{res.targetMedicine.composition}</p>
                        <div className="mt-auto border-t border-slate-700 pt-4">
                          <span className="block text-sm text-slate-500 mb-1">Brand Price</span>
                          <span className="text-3xl font-black text-white">₹{res.targetMedicine.price}</span>
                        </div>
                      </div>

                      {/* VS Divider */}
                      <div className="flex items-center justify-center flex-shrink-0 px-2">
                        <div className="bg-slate-800 rounded-full p-4 font-black text-slate-400 shadow-inner border border-slate-700">
                          VS
                        </div>
                      </div>

                      {/* Generics Cards */}
                      {res.alternatives.map(alt => (
                        <div key={alt._id} className="min-w-[300px] w-[300px] flex-shrink-0 snap-center relative h-full">
                          {alt.comparison && alt.comparison.savings > 0 && (
                            <div className="absolute -top-3 -right-3 z-10 bg-emerald-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-lg shadow-emerald-500/30">
                              Save {alt.comparison.savingsPercentage}%
                            </div>
                          )}
                          <ShopMedicineCard medicine={alt} onDetailsClick={setSelectedMedicine} />
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

      {/* Details Modal */}
      {selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
              <h2 className="text-2xl font-bold text-white">{selectedMedicine.medicineName}</h2>
              <button 
                onClick={() => setSelectedMedicine(null)}
                className="text-slate-400 hover:text-white p-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Manufacturer</p>
                  <p className="text-slate-200 font-medium">{selectedMedicine.manufacturer}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Composition</p>
                  <p className="text-slate-200 font-medium">{selectedMedicine.composition}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Price</p>
                  <p className="text-2xl font-bold text-emerald-400">₹{selectedMedicine.price}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Category / Form</p>
                  <p className="text-slate-200 font-medium">{selectedMedicine.category || 'General'} • {selectedMedicine.dosageForm}</p>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-800 pb-2">Medical Information</h3>
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-slate-300">Uses:</span>
                  <p className="text-slate-400 mt-1">{selectedMedicine.commonUses?.length > 0 ? selectedMedicine.commonUses.join(', ') : 'Information not available'}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-300">Side Effects:</span>
                  <p className="text-slate-400 mt-1">{selectedMedicine.commonSideEffects?.length > 0 ? selectedMedicine.commonSideEffects.join(', ') : 'Information not available'}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-300">Precautions:</span>
                  <p className="text-slate-400 mt-1">{selectedMedicine.precautions || 'Information not available'}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button 
                onClick={() => setSelectedMedicine(null)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionGenerics;
