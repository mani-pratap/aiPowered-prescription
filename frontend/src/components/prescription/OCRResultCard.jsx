import React from 'react';
import { Pill, Calendar, User, Building, Phone, Clock, AlertCircle } from 'lucide-react';

const OCRResultCard = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Doctor & Hospital Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
          <div className="flex items-start space-x-3">
            <Building className="w-6 h-6 text-indigo-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white">{data.doctor?.hospital || 'Hospital Unknown'}</h3>
              <p className="text-slate-400 text-sm mt-1">{data.doctor?.address}</p>
              <div className="flex items-center text-slate-400 text-sm mt-2">
                <Phone className="w-4 h-4 mr-1" />
                {data.doctor?.phone || 'No contact available'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
          <div className="flex items-start space-x-3">
            <User className="w-6 h-6 text-purple-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white">{data.doctor?.name || 'Doctor Unknown'}</h3>
              <p className="text-slate-400 text-sm mt-2 font-medium">Patient Details:</p>
              <p className="text-slate-400 text-sm">
                Name: {data.patient?.name} | Age: {data.patient?.age} | {data.patient?.gender}
              </p>
              <div className="flex items-center text-slate-400 text-sm mt-2">
                <Calendar className="w-4 h-4 mr-1" />
                Prescribed: {data.prescriptionDate || 'Date not found'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medicines List */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Pill className="w-6 h-6 mr-2 text-pink-400" />
          Prescribed Medicines
        </h3>
        <div className="space-y-3">
          {data.medicines?.length > 0 ? (
            data.medicines.map((med, idx) => (
              <div key={idx} className="bg-slate-800/80 rounded-xl p-4 border border-white/10 hover:border-indigo-500/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold text-indigo-300">{med.medicineName || 'Unknown Medicine'}</h4>
                  <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded-lg font-medium border border-indigo-500/30">
                    {med.duration}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="block text-slate-500">Dosage</span>
                    <span className="text-slate-300 font-medium">{med.dosage}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Strength</span>
                    <span className="text-slate-300 font-medium">{med.strength}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-slate-500">Frequency</span>
                    <span className="text-slate-300 font-medium flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> {med.frequency}
                    </span>
                  </div>
                </div>
                {med.instructions && (
                  <div className="mt-3 pt-3 border-t border-white/5 text-sm text-slate-400">
                    <span className="font-medium text-slate-300">Instructions:</span> {med.instructions}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-slate-800/30 rounded-2xl border border-white/5 border-dashed">
              <p className="text-slate-500">No medicines detected in this prescription.</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Notes */}
      {data.additionalNotes && (
        <div className="bg-amber-500/10 rounded-2xl p-5 border border-amber-500/20">
          <h4 className="text-amber-400 font-semibold mb-2 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Additional Notes
          </h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            {data.additionalNotes}
          </p>
        </div>
      )}
    </div>
  );
};

export default OCRResultCard;
