import { useState, useEffect } from 'react';

const categories = [
  'All', 'Fever', 'Cold', 'Cough', 'Diabetes', 'Hypertension', 'Blood Pressure',
  'Pain Relief', 'Antibiotics', 'Allergy', 'Asthma', 'Heart', 'Cholesterol',
  'Vitamin Supplements', 'Skin', 'Eye Drops', 'ENT', 'Digestive',
  'Arthritis', 'Prostate', 'Thyroid', 'Mental Health', 'Pediatric Care', 'Colic'
];

const MedicineFilter = ({ onFilterChange }) => {
  const [category, setCategory] = useState('All');
  const [prescriptionRequired, setPrescriptionRequired] = useState('all'); // 'all', 'true', 'false'
  const [sort, setSort] = useState('-createdAt');

  useEffect(() => {
    onFilterChange({
      category: category === 'All' ? '' : category,
      prescriptionRequired: prescriptionRequired === 'all' ? undefined : prescriptionRequired,
      sort
    });
  }, [category, prescriptionRequired, sort]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sticky top-24">
      <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters & Sort
      </h3>

      {/* Sort Options */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-300 mb-2">Sort By</h4>
        <select 
          className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="-createdAt">Newest First</option>
          <option value="nameAsc">Name (A-Z)</option>
          <option value="nameDesc">Name (Z-A)</option>
          <option value="priceAsc">Price (Low to High)</option>
          <option value="priceDesc">Price (High to Low)</option>
        </select>
      </div>

      <div className="w-full h-px bg-slate-800 my-4"></div>

      {/* Prescription Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Prescription Required</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="radio" name="rx" value="all" checked={prescriptionRequired === 'all'} onChange={(e) => setPrescriptionRequired(e.target.value)} className="text-indigo-600 bg-slate-800 border-slate-600 focus:ring-indigo-600 focus:ring-2" />
            <span className="text-sm text-slate-300">Any</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="radio" name="rx" value="true" checked={prescriptionRequired === 'true'} onChange={(e) => setPrescriptionRequired(e.target.value)} className="text-indigo-600 bg-slate-800 border-slate-600 focus:ring-indigo-600 focus:ring-2" />
            <span className="text-sm text-slate-300">Yes (Rx)</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="radio" name="rx" value="false" checked={prescriptionRequired === 'false'} onChange={(e) => setPrescriptionRequired(e.target.value)} className="text-indigo-600 bg-slate-800 border-slate-600 focus:ring-indigo-600 focus:ring-2" />
            <span className="text-sm text-slate-300">No (OTC)</span>
          </label>
        </div>
      </div>

      <div className="w-full h-px bg-slate-800 my-4"></div>

      {/* Category Filter */}
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center justify-between">
          Categories
          {category !== 'All' && (
            <button onClick={() => setCategory('All')} className="text-xs text-indigo-400 hover:text-indigo-300">
              Clear
            </button>
          )}
        </h4>
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                category === cat 
                  ? 'bg-indigo-600/20 text-indigo-400 font-medium' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicineFilter;
