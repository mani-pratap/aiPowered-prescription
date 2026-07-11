import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import medicineService from '../services/medicineService';
import { DetailsSkeleton } from '../components/ui/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

const MedicineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedicineDetails = async () => {
      try {
        const data = await medicineService.getMedicineById(id);
        setMedicine(data);
      } catch (err) {
        setError('Medicine not found or error occurred.');
        toast.error('Failed to load medicine details');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicineDetails();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <DetailsSkeleton />
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <Link to="/medicines" className="mt-4 inline-block px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
            Back to Medicines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation and Admin actions */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to list
        </button>
        
        {user && (
          <Link 
            to={`/admin/medicines/edit/${medicine._id}`}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm border border-slate-700 flex items-center shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Medicine
          </Link>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="md:flex">
          {/* Image Section */}
          <div className="md:w-1/3 bg-white p-8 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-800">
            <img 
              className="max-w-full max-h-64 object-contain" 
              src={medicine.medicineImage} 
              alt={medicine.medicineName} 
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'https://via.placeholder.com/300?text=Medicine';
              }}
            />
            {medicine.prescriptionRequired && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1.5 rounded-md font-bold uppercase tracking-wider shadow-md">
                Rx Required
              </span>
            )}
          </div>
          
          {/* Key Details Section */}
          <div className="p-8 md:w-2/3">
            <div className="uppercase tracking-wide text-sm text-indigo-400 font-semibold">
              {medicine.category}
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
              {medicine.medicineName}
            </h1>
            <p className="mt-2 text-lg text-slate-300 italic">
              {medicine.genericName}
            </p>
            
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="bg-slate-800 rounded-lg px-4 py-2 border border-slate-700">
                <span className="block text-xs text-slate-400 uppercase font-semibold">Dosage Form</span>
                <span className="text-slate-200">{medicine.dosageForm}</span>
              </div>
              <div className="bg-slate-800 rounded-lg px-4 py-2 border border-slate-700">
                <span className="block text-xs text-slate-400 uppercase font-semibold">Manufacturer</span>
                <span className="text-slate-200">{medicine.manufacturer}</span>
              </div>
              {medicine.strength && (
                <div className="bg-slate-800 rounded-lg px-4 py-2 border border-slate-700">
                  <span className="block text-xs text-slate-400 uppercase font-semibold">Strength</span>
                  <span className="text-slate-200">{medicine.strength}</span>
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-slate-800 pt-6">
              <div className="flex items-end">
                <span className="text-4xl font-black text-indigo-400">₹{medicine.price}</span>
                {medicine.discount > 0 && (
                  <div className="ml-3 pb-1">
                    <span className="line-through text-slate-500 text-sm">MRP ₹{medicine.mrp}</span>
                    <span className="ml-2 text-emerald-400 font-medium text-sm bg-emerald-400/10 px-2 py-0.5 rounded">
                      {medicine.discount}% OFF
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Details Tabs/Sections */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-3 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Overview
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-300">Composition</h4>
                <p className="text-slate-400 mt-1">{medicine.composition}</p>
              </div>
              {medicine.purpose && (
                <div>
                  <h4 className="font-semibold text-slate-300">Purpose</h4>
                  <p className="text-slate-400 mt-1">{medicine.purpose}</p>
                </div>
              )}
              {medicine.brandName && (
                <div>
                  <h4 className="font-semibold text-slate-300">Brand Name</h4>
                  <p className="text-slate-400 mt-1">{medicine.brandName}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-3 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Uses & Side Effects
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-300 mb-2">Common Uses</h4>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  {medicine.commonUses && medicine.commonUses.length > 0 ? (
                    medicine.commonUses.map((use, index) => <li key={index}>{use}</li>)
                  ) : (
                    <li>Information not available</li>
                  )}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-300 mb-2">Side Effects</h4>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  {medicine.commonSideEffects && medicine.commonSideEffects.length > 0 ? (
                    medicine.commonSideEffects.map((effect, index) => <li key={index}>{effect}</li>)
                  ) : (
                    <li>Information not available</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          
        </div>

        <div className="space-y-8">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-3 mb-4">Safety Advice</h3>
            
            <div className="space-y-4">
              {medicine.precautions && (
                <div>
                  <h4 className="font-semibold text-amber-400 flex items-center text-sm uppercase">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Precautions
                  </h4>
                  <p className="text-slate-400 mt-1 text-sm">{medicine.precautions}</p>
                </div>
              )}
              
              {medicine.foodInteraction && (
                <div>
                  <h4 className="font-semibold text-blue-400 flex items-center text-sm uppercase mt-4">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Food Interaction
                  </h4>
                  <p className="text-slate-400 mt-1 text-sm">{medicine.foodInteraction}</p>
                </div>
              )}
              
              {medicine.storageInstructions && (
                <div>
                  <h4 className="font-semibold text-emerald-400 flex items-center text-sm uppercase mt-4">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Storage
                  </h4>
                  <p className="text-slate-400 mt-1 text-sm">{medicine.storageInstructions}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-3 mb-4">Alternatives</h3>
            {medicine.alternativeMedicines && medicine.alternativeMedicines.length > 0 ? (
              <ul className="space-y-2">
                {medicine.alternativeMedicines.map((alt, index) => (
                  <li key={index} className="bg-slate-800 p-2 rounded text-slate-300 text-sm border border-slate-700">
                    {alt}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm">No alternatives listed.</p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default MedicineDetails;
