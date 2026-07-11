import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: [true, 'Please add a medicine name'],
      trim: true,
    },
    genericName: {
      type: String,
      required: [true, 'Please add a generic name'],
      trim: true,
    },
    composition: {
      type: String,
      required: [true, 'Please add a formula / composition'],
    },
    brandName: {
      type: String,
      trim: true,
    },
    manufacturer: {
      type: String,
      required: [true, 'Please add a manufacturer'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
    },
    dosageForm: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Injection', 'Drops', 'Syrup', 'Cream', 'Other'],
      default: 'Tablet',
    },
    strength: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    mrp: {
      type: Number,
    },
    discount: {
      type: Number,
      default: 0,
    },
    purpose: {
      type: String,
    },
    commonUses: {
      type: [String],
    },
    commonSideEffects: {
      type: [String],
    },
    precautions: {
      type: String,
    },
    foodInteraction: {
      type: String,
    },
    storageInstructions: {
      type: String,
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    alternativeMedicines: {
      type: [String],
    },
    medicineImage: {
      type: String,
      default: 'https://via.placeholder.com/150',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching
medicineSchema.index({ medicineName: 'text', genericName: 'text', manufacturer: 'text', category: 'text' });

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
