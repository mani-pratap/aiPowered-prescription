import mongoose from 'mongoose';

const prescriptionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    imageUrl: {
      type: String,
      required: true,
    },
    rawOcrText: {
      type: String,
      default: '',
    },
    structuredData: {
      doctor: {
        name: { type: String, default: '' },
        hospital: { type: String, default: '' },
        address: { type: String, default: '' },
        phone: { type: String, default: '' },
      },
      patient: {
        name: { type: String, default: '' },
        age: { type: String, default: '' },
        gender: { type: String, default: '' },
      },
      prescriptionDate: { type: String, default: '' },
      medicines: [
        {
          medicineName: { type: String, default: '' },
          dosage: { type: String, default: '' },
          strength: { type: String, default: '' },
          frequency: { type: String, default: '' },
          duration: { type: String, default: '' },
          instructions: { type: String, default: '' },
        },
      ],
      additionalNotes: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    imageHash: {
      type: String,
      index: true,
    },
    genericsData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
