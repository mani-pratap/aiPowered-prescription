import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Lock, Save, Loader2, Camera, Plus, Trash2, Edit2, X } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [medicines, setMedicines] = useState(user?.medicineSchedule || []);
  const [patientType, setPatientType] = useState(user?.patientType || 'occasional');
  const [primaryDisease, setPrimaryDisease] = useState(user?.primaryDisease || '');
  
  const [isAddingMedicine, setIsAddingMedicine] = useState(false);
  const [editingMedicineId, setEditingMedicineId] = useState(null);

  const { register: registerProfile, handleSubmit: handleProfileSubmit } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    }
  });

  const { register: registerMed, handleSubmit: handleMedSubmit, reset: resetMed, setValue: setMedValue, watch: watchMed } = useForm({
    defaultValues: {
      medicineName: '',
      dosage: '',
      frequency: 'Once Daily',
      morning: false,
      afternoon: false,
      night: false,
      startDate: '',
      refillCycle: 30,
      dailyReminderEnabled: false,
      refillReminderEnabled: false,
      reminderBeforeDays: 5,
      status: 'active'
    }
  });

  useEffect(() => {
    // If user changes in context, sync local state
    if (user) {
      setMedicines(user.medicineSchedule || []);
      setPatientType(user.patientType || 'occasional');
      setPrimaryDisease(user.primaryDisease || '');
    }
  }, [user]);

  const onProfileSubmit = async (data) => {
    setIsLoading(true);
    await updateProfile(data);
    setIsLoading(false);
    setIsEditingProfile(false);
  };

  const savePatientSettings = async () => {
    setIsLoading(true);
    try {
      const res = await api.put('/profile/reminders', {
        patientType,
        primaryDisease: patientType === 'regular' ? primaryDisease : ''
      });
      setMedicines(res.data.medicineSchedule || []);
      setPatientType(res.data.patientType);
      setPrimaryDisease(res.data.primaryDisease);
      toast.success('Patient settings updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const onMedSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        refillCycle: Number(data.refillCycle),
        reminderBeforeDays: Number(data.reminderBeforeDays),
        dailyReminderEnabled: String(data.dailyReminderEnabled) === 'true',
        refillReminderEnabled: String(data.refillReminderEnabled) === 'true',
      };

      if (editingMedicineId) {
        const res = await api.put(`/profile/medicine/${editingMedicineId}`, payload);
        setMedicines(res.data);
        toast.success('Medicine updated!');
      } else {
        const res = await api.post('/profile/medicine', payload);
        setMedicines(res.data);
        toast.success('Medicine added!');
      }
      setIsAddingMedicine(false);
      setEditingMedicineId(null);
      resetMed();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save medicine');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMedicine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    setIsLoading(true);
    try {
      const res = await api.delete(`/profile/medicine/${id}`);
      setMedicines(res.data);
      toast.success('Medicine deleted!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete medicine');
    } finally {
      setIsLoading(false);
    }
  };

  const editMedicine = (med) => {
    setEditingMedicineId(med._id);
    setIsAddingMedicine(true);
    Object.keys(med).forEach(key => {
      setMedValue(key, med[key]);
    });
    // Fix boolean conversions for selects
    setMedValue('dailyReminderEnabled', String(med.dailyReminderEnabled));
    setMedValue('refillReminderEnabled', String(med.refillReminderEnabled));
  };

  const cancelMedEdit = () => {
    setIsAddingMedicine(false);
    setEditingMedicineId(null);
    resetMed();
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Profile Section */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 h-32 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative group">
              <img
                src={user?.profileImage}
                alt={user?.fullName}
                className="w-24 h-24 rounded-2xl border-4 border-slate-900 object-cover bg-slate-800"
              />
              <button className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.fullName}</h1>
              <p className="text-slate-400">{patientType === 'regular' ? 'Regular Medicine User' : 'Occasional User'}</p>
            </div>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors font-medium text-slate-300"
            >
              {isEditingProfile ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    {...registerProfile("fullName", { required: "Required" })}
                    className="block w-full pl-10 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    disabled={!isEditingProfile}
                    {...registerProfile("email", { required: "Required" })}
                    className="block w-full pl-10 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="tel"
                    disabled={!isEditingProfile}
                    {...registerProfile("phoneNumber")}
                    className="block w-full pl-10 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {isEditingProfile && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      type="password"
                      {...registerProfile("password")}
                      placeholder="Leave blank to keep current"
                      className="block w-full pl-10 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {isEditingProfile && (
              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-indigo-500/25"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Patient Settings Section */}
      <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Patient Settings</h2>
          <button
            onClick={savePatientSettings}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Settings'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Patient Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="occasional"
                  checked={patientType === 'occasional'}
                  onChange={(e) => setPatientType(e.target.value)}
                  className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                />
                <span className="text-slate-300">Occasional User</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="regular"
                  checked={patientType === 'regular'}
                  onChange={(e) => setPatientType(e.target.value)}
                  className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                />
                <span className="text-slate-300">Regular Medicine User</span>
              </label>
            </div>
          </div>

          {patientType === 'regular' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <label className="block text-sm font-medium text-slate-300 mb-1">Primary Disease</label>
              <input
                type="text"
                value={primaryDisease}
                onChange={(e) => setPrimaryDisease(e.target.value)}
                className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="e.g., Hypertension"
              />
            </div>
          )}
        </div>
      </div>

      {/* Medicine Schedule Section */}
      {patientType === 'regular' && (
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Medicine Schedule</h2>
            {!isAddingMedicine && (
              <button
                onClick={() => setIsAddingMedicine(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Medicine
              </button>
            )}
          </div>

          {isAddingMedicine && (
            <form onSubmit={handleMedSubmit(onMedSubmit)} className="p-6 bg-slate-800/50 border border-purple-500/30 rounded-2xl mb-8 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">{editingMedicineId ? 'Edit Medicine' : 'New Medicine'}</h3>
                <button type="button" onClick={cancelMedEdit} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Medicine Name</label>
                  <input type="text" {...registerMed('medicineName', { required: true })} className="block w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Dosage</label>
                  <input type="text" {...registerMed('dosage', { required: true })} className="block w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Frequency</label>
                  <input type="text" {...registerMed('frequency', { required: true })} className="block w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Start Date</label>
                  <input type="date" {...registerMed('startDate', { required: true })} className="block w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Intake Timing</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" {...registerMed('morning')} className="rounded bg-slate-900 border-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-900" /> Morning
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" {...registerMed('afternoon')} className="rounded bg-slate-900 border-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-900" /> Afternoon
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" {...registerMed('night')} className="rounded bg-slate-900 border-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-900" /> Night
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Expected Refill Cycle</label>
                  <select {...registerMed('refillCycle')} className="block w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm">
                    <option value="15">15 Days</option>
                    <option value="30">30 Days</option>
                    <option value="45">45 Days</option>
                    <option value="60">60 Days</option>
                    <option value="90">90 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Daily Reminder</label>
                  <select {...registerMed('dailyReminderEnabled')} className="block w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Refill Reminder</label>
                  <select {...registerMed('refillReminderEnabled')} className="block w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              
              {watchMed('refillReminderEnabled') === 'true' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Reminder Before</label>
                  <select {...registerMed('reminderBeforeDays')} className="block w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm">
                    <option value="1">1 Day</option>
                    <option value="3">3 Days</option>
                    <option value="5">5 Days</option>
                    <option value="7">7 Days</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={cancelMedEdit} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white font-medium flex items-center">
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save Medicine
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {medicines.length === 0 && !isAddingMedicine ? (
              <div className="text-center py-8 text-slate-500">
                No medicines added yet.
              </div>
            ) : (
              medicines.map((med) => (
                <div key={med._id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between group transition-colors hover:bg-white/10">
                  <div>
                    <h4 className="text-white font-medium">{med.medicineName} <span className="text-sm font-normal text-slate-400 ml-2">({med.dosage})</span></h4>
                    <p className="text-sm text-slate-400 mt-1">
                      {med.frequency} • Started: {new Date(med.startDate).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {med.morning && <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-xs">Morning</span>}
                      {med.afternoon && <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded text-xs">Afternoon</span>}
                      {med.night && <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs">Night</span>}
                      {med.dailyReminderEnabled && <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs">Daily Reminder ON</span>}
                      {med.refillReminderEnabled && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">Refill Reminder ON</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => editMedicine(med)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteMedicine(med._id)} className="p-2 text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
