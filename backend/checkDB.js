import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const data = await mongoose.connection.db.collection('diseaseanalyses').findOne({});
  console.log(JSON.stringify(data, null, 2));
  mongoose.disconnect();
};
run();
