import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please add a full name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    profileImage: {
      type: String,
      default: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    },
    phoneNumber: {
      type: String,
      match: [
        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
        'Please add a valid phone number',
      ],
    },
    patientType: {
      type: String,
      enum: ['regular', 'occasional'],
      default: 'occasional',
    },
    primaryDisease: {
      type: String,
      default: '',
    },
    medicineSchedule: [
      {
        medicineName: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        reminderTimes: [{ type: String }],
        startDate: { type: String },
        refillCycle: { type: Number },
        dailyReminderEnabled: { type: Boolean, default: false },
        refillReminderEnabled: { type: Boolean, default: false },
        reminderBeforeDays: { type: Number },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
      }
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
