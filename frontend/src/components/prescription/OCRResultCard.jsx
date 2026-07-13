import React, { useState } from 'react';
import { Pill, Calendar, User, Building, Phone, Clock, AlertCircle, MapPin, Bell, X, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const OCRResultCard = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [morningTime, setMorningTime] = useState('08:00');
  const [nightTime, setNightTime] = useState('20:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  if (!data) return null;

  const handleSetupReminders = async () => {
    setIsSubmitting(true);
    try {
      // Map OCR medicines to backend schema
      const mappedMedicines = data.medicines.map(med => {
        let times = [];
        const freqStr = med.frequency ? med.frequency.toLowerCase() : '';
        
        if (freqStr.includes('twice') || freqStr.includes('2')) {
          times = [morningTime, nightTime];
        } else if (freqStr.includes('night') || freqStr.includes('bed')) {
          times = [nightTime];
        } else {
          times = [morningTime];
        }

        return {
          medicineName: med.medicineName || 'Unknown Medicine',
          dosage: med.dosage || med.strength || 'As prescribed',
          frequency: med.frequency || 'Once Daily',
          reminderTimes: times,
          startDate: data.prescriptionDate || new Date().toISOString().split('T')[0],
          dailyReminderEnabled: true
        };
      });

      const res = await api.post('/profile/medicine/batch', { medicines: mappedMedicines });
      updateUser({ medicineSchedule: res.data });
      toast.success('Medicines added to your reminders!');
      setIsModalOpen(false);
      navigate('/profile'); // Redirect to profile to see them
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to setup reminders');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Doctor & Hospital Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
          <div className="flex items-start space-x-3">
            <Building className="w-6 h-6 text-indigo-400 mt-1" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{data.doctor?.hospital || 'Hospital Unknown'}</h3>
                  <p className="text-slate-400 text-sm mt-1 pr-2">{data.doctor?.address}</p>
                </div>
                {data.doctor?.address && (
                  <Link 
                    to="/pharmacies" 
                    title="Find nearby pharmacies for this location"
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors flex shrink-0 items-center justify-center border border-emerald-500/20"
                  >
                    <MapPin className="w-5 h-5" />
                  </Link>
                )}
              </div>
              <div className="flex items-center text-slate-400 text-sm mt-3 pt-3 border-t border-white/5">
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
        
        {data.medicines?.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-105"
            >
              <Bell className="w-5 h-5 mr-2" />
              Set Up Reminders for These Medicines
            </button>
          </div>
        )}
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

      {/* Reminder Time Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Bell className="w-5 h-5 mr-2 text-indigo-400" />
                Configure Reminders
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-slate-300 text-sm mb-6">
              At what time do you want to be reminded for your Morning and Night doses? We will automatically assign these to the extracted medicines based on their frequency.
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Morning Dose Time</label>
                <input 
                  type="time" 
                  value={morningTime}
                  onChange={(e) => setMorningTime(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Night Dose Time</label>
                <input 
                  type="time" 
                  value={nightTime}
                  onChange={(e) => setNightTime(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSetupReminders}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center shadow-lg shadow-indigo-500/25 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Bell className="w-5 h-5 mr-2" />}
                Import & Enable Reminders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OCRResultCard;
