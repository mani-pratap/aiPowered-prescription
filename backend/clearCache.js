import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Prescription from './models/Prescription.js';

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-prescription')
  .then(async () => {
    await Prescription.updateMany({}, { $set: { genericsData: [] } });
    console.log('Cache cleared successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
