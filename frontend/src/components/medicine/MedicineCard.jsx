import { Link } from 'react-router-dom';

const MedicineCard = ({ medicine }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-full group">
      <div className="relative h-48 overflow-hidden bg-slate-800 flex items-center justify-center p-4">
        <img 
          src={medicine.medicineImage} 
          alt={medicine.medicineName} 
          className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = 'https://via.placeholder.com/150?text=Medicine';
          }}
        />
        {medicine.prescriptionRequired && (
          <span className="absolute top-2 right-2 bg-red-500/90 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm">
            Rx Required
          </span>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-slate-100 truncate pr-2" title={medicine.medicineName}>
            {medicine.medicineName}
          </h3>
        </div>
        
        <p className="text-sm text-slate-400 mb-3 truncate" title={medicine.genericName}>
          {medicine.genericName}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-block px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-md">
            {medicine.category}
          </span>
          <span className="inline-block px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-md">
            {medicine.dosageForm}
          </span>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-indigo-400">₹{medicine.price}</span>
              {medicine.discount > 0 && (
                <div className="flex items-center space-x-2 text-xs">
                  <span className="line-through text-slate-500">₹{medicine.mrp}</span>
                  <span className="text-emerald-400">{medicine.discount}% OFF</span>
                </div>
              )}
            </div>
            <span className="text-xs text-slate-500 max-w-[50%] truncate text-right">
              {medicine.manufacturer}
            </span>
          </div>
          
          <Link 
            to={`/medicines/${medicine._id}`}
            className="block w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-center rounded-lg transition-colors text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MedicineCard;
