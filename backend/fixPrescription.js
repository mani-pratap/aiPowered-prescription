import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Prescription from './models/Prescription.js';
import Medicine from './models/Medicine.js';

dotenv.config();

const run = async () => {
  await connectDB();
  
  const prescriptions = await Prescription.find();
  const brandMeds = await Medicine.find({ brandName: { $regex: 'Brand' } }).limit(3);
  
  if (brandMeds.length > 0) {
    for (let prescription of prescriptions) {
      prescription.structuredData.medicines = brandMeds.map(med => ({
        medicineName: med.medicineName,
        dosage: med.dosageForm,
        frequency: "1-0-1",
        duration: "5 Days"
      }));
      await prescription.save();
    }
    console.log(`Updated ${prescriptions.length} prescriptions with valid branded medicines!`);
  } else {
    console.log('No brand medicines found.');
  }
  process.exit();
};

run();
