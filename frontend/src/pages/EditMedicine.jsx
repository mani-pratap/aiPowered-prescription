import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import medicineService from '../services/medicineService';

const EditMedicine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    medicineName: '',
    genericName: '',
    composition: '',
    brandName: '',
    manufacturer: '',
    category: 'General',
    dosageForm: 'Tablet',
    strength: '',
    price: '',
    mrp: '',
    discount: '0',
    purpose: '',
    commonUses: '',
    commonSideEffects: '',
    precautions: '',
    foodInteraction: '',
    storageInstructions: '',
    prescriptionRequired: false,
    alternativeMedicines: '',
    medicineImage: ''
  });

  const categories = [
    'General', 'Fever', 'Cold', 'Cough', 'Diabetes', 'Hypertension', 'Blood Pressure',
    'Pain Relief', 'Antibiotics', 'Allergy', 'Asthma', 'Heart', 'Cholesterol',
    'Vitamin Supplements', 'Skin', 'Eye Drops', 'ENT', 'Digestive',
    'Arthritis', 'Prostate', 'Thyroid', 'Mental Health', 'Pediatric Care', 'Colic'
  ];

  const dosageForms = ['Tablet', 'Capsule', 'Injection', 'Drops', 'Syrup', 'Cream', 'Other'];

  useEffect(() => {
    const fetchMed = async () => {
      try {
        const med = await medicineService.getMedicineById(id);
        setFormData({
          ...med,
          commonUses: med.commonUses ? med.commonUses.join(', ') : '',
          commonSideEffects: med.commonSideEffects ? med.commonSideEffects.join(', ') : '',
          alternativeMedicines: med.alternativeMedicines ? med.alternativeMedicines.join(', ') : ''
        });
      } catch (error) {
        toast.error('Failed to fetch medicine details');
        navigate('/admin/medicines');
      } finally {
        setFetching(false);
      }
    };
    fetchMed();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        price: Number(formData.price),
        mrp: Number(formData.mrp),
        discount: Number(formData.discount),
        commonUses: formData.commonUses && typeof formData.commonUses === 'string' ? formData.commonUses.split(',').map(s => s.trim()) : formData.commonUses,
        commonSideEffects: formData.commonSideEffects && typeof formData.commonSideEffects === 'string' ? formData.commonSideEffects.split(',').map(s => s.trim()) : formData.commonSideEffects,
        alternativeMedicines: formData.alternativeMedicines && typeof formData.alternativeMedicines === 'string' ? formData.alternativeMedicines.split(',').map(s => s.trim()) : formData.alternativeMedicines
      };

      await medicineService.updateMedicine(id, submitData);
      toast.success('Medicine updated successfully');
      navigate('/admin/medicines');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update medicine');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center py-20 text-slate-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-indigo-400 hover:text-indigo-300 mr-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-3xl font-bold text-slate-100">Edit Medicine</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-lg">
        {/* Same form fields as AddMedicine */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Medicine Name *</label>
            <input type="text" name="medicineName" required value={formData.medicineName} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Generic Name *</label>
            <input type="text" name="genericName" required value={formData.genericName} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Manufacturer / Company *</label>
            <input type="text" name="manufacturer" required value={formData.manufacturer} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Brand Name</label>
            <input type="text" name="brandName" value={formData.brandName} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Composition / Formula *</label>
          <input type="text" name="composition" required value={formData.composition} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Dosage Form</label>
            <select name="dosageForm" value={formData.dosageForm} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500">
              {dosageForms.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Strength</label>
            <input type="text" name="strength" value={formData.strength} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Price (₹) *</label>
            <input type="number" name="price" required value={formData.price} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">MRP (₹)</label>
            <input type="number" name="mrp" value={formData.mrp} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Discount (%)</label>
            <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Purpose</label>
          <input type="text" name="purpose" value={formData.purpose} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Common Uses (comma separated)</label>
            <textarea name="commonUses" rows="3" value={formData.commonUses} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Side Effects (comma separated)</label>
            <textarea name="commonSideEffects" rows="3" value={formData.commonSideEffects} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Precautions</label>
            <textarea name="precautions" rows="2" value={formData.precautions} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Food Interactions</label>
            <textarea name="foodInteraction" rows="2" value={formData.foodInteraction} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Storage Instructions</label>
          <input type="text" name="storageInstructions" value={formData.storageInstructions} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div className="mb-6 flex items-center">
          <input type="checkbox" id="rx" name="prescriptionRequired" checked={formData.prescriptionRequired} onChange={handleChange} className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-700 rounded focus:ring-indigo-500" />
          <label htmlFor="rx" className="ml-2 text-sm font-medium text-slate-300">Prescription Required</label>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-2">Image URL</label>
          <input type="text" name="medicineImage" value={formData.medicineImage} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium">
            {loading ? 'Updating...' : 'Update Medicine'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMedicine;
