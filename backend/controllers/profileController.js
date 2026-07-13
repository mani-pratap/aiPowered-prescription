import User from '../models/User.js';

// @desc    Get profile reminders/settings
// @route   GET /api/profile/reminders
// @access  Private
const getReminders = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        patientType: user.patientType,
        primaryDisease: user.primaryDisease,
        medicineSchedule: user.medicineSchedule,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile reminders/settings (Patient Type, Disease, global toggles)
// @route   PUT /api/profile/reminders
// @access  Private
const updateReminders = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (req.body.patientType !== undefined) user.patientType = req.body.patientType;
      if (req.body.primaryDisease !== undefined) user.primaryDisease = req.body.primaryDisease;

      const updatedUser = await user.save();
      res.json({
        patientType: updatedUser.patientType,
        primaryDisease: updatedUser.primaryDisease,
        medicineSchedule: updatedUser.medicineSchedule,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new medicine to schedule
// @route   POST /api/profile/medicine
// @access  Private
const addMedicine = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      const {
        medicineName, dosage, frequency, reminderTimes,
        startDate, refillCycle, dailyReminderEnabled, refillReminderEnabled, reminderBeforeDays, status
      } = req.body;
      
      if (!medicineName || !dosage || !frequency) {
        res.status(400);
        throw new Error('Please provide medicine name, dosage, and frequency');
      }

      const newMedicine = {
        medicineName,
        dosage,
        frequency,
        reminderTimes: Array.isArray(reminderTimes) ? reminderTimes : [],
        startDate,
        refillCycle: refillCycle || 30,
        dailyReminderEnabled: dailyReminderEnabled || false,
        refillReminderEnabled: refillReminderEnabled || false,
        reminderBeforeDays: reminderBeforeDays || 5,
        status: status || 'active'
      };

      user.medicineSchedule.push(newMedicine);
      const updatedUser = await user.save();

      res.status(201).json(updatedUser.medicineSchedule);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add multiple medicines to schedule (Batch)
// @route   POST /api/profile/medicine/batch
// @access  Private
const addMedicinesBatch = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      const { medicines } = req.body;
      
      if (!Array.isArray(medicines) || medicines.length === 0) {
        res.status(400);
        throw new Error('Please provide an array of medicines');
      }

      medicines.forEach(med => {
        const newMedicine = {
          medicineName: med.medicineName,
          dosage: med.dosage || 'As prescribed',
          frequency: med.frequency || 'Once Daily',
          reminderTimes: Array.isArray(med.reminderTimes) ? med.reminderTimes : [],
          startDate: med.startDate || new Date().toISOString().split('T')[0],
          refillCycle: med.refillCycle || 30,
          dailyReminderEnabled: med.dailyReminderEnabled !== undefined ? med.dailyReminderEnabled : false,
          refillReminderEnabled: med.refillReminderEnabled !== undefined ? med.refillReminderEnabled : false,
          reminderBeforeDays: med.reminderBeforeDays || 5,
          status: med.status || 'active'
        };
        user.medicineSchedule.push(newMedicine);
      });

      const updatedUser = await user.save();
      res.status(201).json(updatedUser.medicineSchedule);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update a medicine
// @route   PUT /api/profile/medicine/:id
// @access  Private
const updateMedicine = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      const medicine = user.medicineSchedule.id(req.params.id);
      
      if (medicine) {
        medicine.medicineName = req.body.medicineName || medicine.medicineName;
        medicine.dosage = req.body.dosage || medicine.dosage;
        medicine.frequency = req.body.frequency || medicine.frequency;
        if (req.body.reminderTimes !== undefined) medicine.reminderTimes = Array.isArray(req.body.reminderTimes) ? req.body.reminderTimes : [];
        medicine.startDate = req.body.startDate || medicine.startDate;
        medicine.refillCycle = req.body.refillCycle || medicine.refillCycle;
        if (req.body.dailyReminderEnabled !== undefined) medicine.dailyReminderEnabled = req.body.dailyReminderEnabled;
        if (req.body.refillReminderEnabled !== undefined) medicine.refillReminderEnabled = req.body.refillReminderEnabled;
        medicine.reminderBeforeDays = req.body.reminderBeforeDays || medicine.reminderBeforeDays;
        medicine.status = req.body.status || medicine.status;

        const updatedUser = await user.save();
        res.json(updatedUser.medicineSchedule);
      } else {
        res.status(404);
        throw new Error('Medicine not found');
      }
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a medicine
// @route   DELETE /api/profile/medicine/:id
// @access  Private
const deleteMedicine = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      const initialLength = user.medicineSchedule.length;
      user.medicineSchedule = user.medicineSchedule.filter(
        (med) => med._id.toString() !== req.params.id
      );

      if (user.medicineSchedule.length === initialLength) {
        res.status(404);
        throw new Error('Medicine not found');
      }

      const updatedUser = await user.save();
      res.json(updatedUser.medicineSchedule);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

export {
  getReminders,
  updateReminders,
  addMedicine,
  addMedicinesBatch,
  updateMedicine,
  deleteMedicine
};
