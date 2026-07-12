import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, Loader2, Stethoscope, Plus, Trash2 } from 'lucide-react';

const Register = () => {
  const { register: registerForm, handleSubmit, formState: { errors }, watch, control } = useForm({
    defaultValues: {
      patientType: 'occasional',
      medicineSchedule: [{
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
        reminderBeforeDays: 5
      }]
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "medicineSchedule"
  });

  const patientType = watch('patientType');

  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    // Clean up data based on patient type
    const payload = {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      phoneNumber: data.phoneNumber,
      patientType: data.patientType,
    };

    if (data.patientType === 'regular') {
      payload.primaryDisease = data.primaryDisease;
      // Convert boolean strings to actual booleans if necessary, react-hook-form usually handles this
      payload.medicineSchedule = data.medicineSchedule.map(med => ({
        ...med,
        refillCycle: Number(med.refillCycle),
        reminderBeforeDays: Number(med.reminderBeforeDays),
        dailyReminderEnabled: String(med.dailyReminderEnabled) === 'true' || med.dailyReminderEnabled === true,
        refillReminderEnabled: String(med.refillReminderEnabled) === 'true' || med.refillReminderEnabled === true,
      }));
    } else {
      payload.primaryDisease = '';
      payload.medicineSchedule = [];
    }

    const success = await register(payload);
    setIsLoading(false);
    if (success) {
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-2xl w-full space-y-8 bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
            <Stethoscope className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Create an account</h2>
          <p className="mt-2 text-sm text-slate-400">
            Join ArogyaSaathi and start managing your health
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  {...registerForm("fullName", { required: "Full name is required" })}
                  className="block w-full pl-10 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && <p className="mt-1 text-sm text-red-400">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  {...registerForm("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  className="block w-full pl-10 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="tel"
                  {...registerForm("phoneNumber")}
                  className="block w-full pl-10 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  {...registerForm("password", { 
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" }
                  })}
                  className="block w-full pl-10 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <label className="block text-sm font-medium text-slate-300 mb-3">Patient Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="occasional"
                  {...registerForm("patientType")}
                  className="w-4 h-4 text-purple-600 bg-white/5 border-white/10 focus:ring-purple-500 focus:ring-offset-slate-900"
                />
                <span className="text-slate-300">Occasional User</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="regular"
                  {...registerForm("patientType")}
                  className="w-4 h-4 text-purple-600 bg-white/5 border-white/10 focus:ring-purple-500 focus:ring-offset-slate-900"
                />
                <span className="text-slate-300">Regular Medicine User</span>
              </label>
            </div>
          </div>

          {patientType === 'regular' && (
            <div className="space-y-6 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Primary Disease</label>
                <input
                  type="text"
                  {...registerForm("primaryDisease", { required: patientType === 'regular' ? "Primary disease is required" : false })}
                  className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="e.g., Hypertension"
                />
                {errors.primaryDisease && <p className="mt-1 text-sm text-red-400">{errors.primaryDisease.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-slate-300">Current Medicines</label>
                  <button
                    type="button"
                    onClick={() => append({
                      medicineName: '', dosage: '', frequency: 'Once Daily', morning: false, afternoon: false, night: false, startDate: '', refillCycle: 30, dailyReminderEnabled: false, refillReminderEnabled: false, reminderBeforeDays: 5
                    })}
                    className="text-sm flex items-center gap-1 text-purple-400 hover:text-purple-300"
                  >
                    <Plus className="w-4 h-4" /> Add Medicine
                  </button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4 relative">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Medicine Name</label>
                          <input
                            type="text"
                            {...registerForm(`medicineSchedule.${index}.medicineName`, { required: "Required" })}
                            className="block w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                            placeholder="Medicine Name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Dosage</label>
                          <input
                            type="text"
                            {...registerForm(`medicineSchedule.${index}.dosage`, { required: "Required" })}
                            className="block w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., 5 mg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Frequency</label>
                          <input
                            type="text"
                            {...registerForm(`medicineSchedule.${index}.frequency`, { required: "Required" })}
                            className="block w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., Once Daily"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Start Date</label>
                          <input
                            type="date"
                            {...registerForm(`medicineSchedule.${index}.startDate`, { required: "Required" })}
                            className="block w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2">Intake Timing</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm text-slate-300">
                            <input type="checkbox" {...registerForm(`medicineSchedule.${index}.morning`)} className="rounded bg-slate-900/50 border-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-900" />
                            Morning
                          </label>
                          <label className="flex items-center gap-2 text-sm text-slate-300">
                            <input type="checkbox" {...registerForm(`medicineSchedule.${index}.afternoon`)} className="rounded bg-slate-900/50 border-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-900" />
                            Afternoon
                          </label>
                          <label className="flex items-center gap-2 text-sm text-slate-300">
                            <input type="checkbox" {...registerForm(`medicineSchedule.${index}.night`)} className="rounded bg-slate-900/50 border-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-900" />
                            Night
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Expected Refill Cycle</label>
                          <select
                            {...registerForm(`medicineSchedule.${index}.refillCycle`)}
                            className="block w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="15">15 Days</option>
                            <option value="30">30 Days</option>
                            <option value="45">45 Days</option>
                            <option value="60">60 Days</option>
                            <option value="90">90 Days</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Daily Reminder</label>
                          <select
                            {...registerForm(`medicineSchedule.${index}.dailyReminderEnabled`)}
                            className="block w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Refill Reminder</label>
                          <select
                            {...registerForm(`medicineSchedule.${index}.refillReminderEnabled`)}
                            className="block w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </div>
                      </div>
                      
                      {watch(`medicineSchedule.${index}.refillReminderEnabled`) === 'true' && (
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Reminder Before</label>
                          <select
                            {...registerForm(`medicineSchedule.${index}.reminderBeforeDays`)}
                            className="block w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="1">1 Day</option>
                            <option value="3">3 Days</option>
                            <option value="5">5 Days</option>
                            <option value="7">7 Days</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25 mt-6"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
