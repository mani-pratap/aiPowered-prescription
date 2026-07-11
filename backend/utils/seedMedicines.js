import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Medicine from '../models/Medicine.js';
import connectDB from '../config/db.js';

dotenv.config();

connectDB();

const categories = [
  'Fever', 'Cold', 'Cough', 'Diabetes', 'Hypertension', 'Blood Pressure',
  'Pain Relief', 'Antibiotics', 'Allergy', 'Asthma', 'Heart', 'Cholesterol',
  'Vitamin Supplements', 'Skin', 'Eye Drops', 'ENT', 'Digestive',
  'Arthritis', 'Prostate', 'Thyroid', 'Mental Health', 'Pediatric Care', 'Colic'
];

const dosageForms = ['Tablet', 'Capsule', 'Injection', 'Drops', 'Syrup', 'Cream'];
const manufacturers = ['Sun Pharma', 'Cipla', 'Dr. Reddy\'s', 'Lupin', 'Aurobindo Pharma', 'Zydus Lifesciences', 'Torrent Pharma', 'Alkem Labs', 'Mankind Pharma', 'Biocon'];

const generateDummyMedicines = (count) => {
  const medicines = [];
  
  // Create 'count' unique active ingredients/compositions
  for (let i = 1; i <= count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const dosageForm = dosageForms[Math.floor(Math.random() * dosageForms.length)];
    const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    const brandPrice = Math.floor(Math.random() * 500) + 150; // Branded is expensive
    const brandMrp = brandPrice + Math.floor(Math.random() * 50);
    const composition = `Active Ingredient ${i} 500mg`;
    const genericName = `Generic ${category} Formula ${i}`;
    const rxReq = Math.random() > 0.5;
    
    // Branded Medicine
    medicines.push({
      medicineName: `BrandMed${category.replace(' ', '')}${i} ${dosageForm}`,
      genericName,
      composition,
      brandName: `Brand${i}`,
      manufacturer,
      category,
      dosageForm,
      strength: '500mg',
      price: brandPrice,
      mrp: brandMrp,
      discount: Math.floor(((brandMrp - brandPrice) / brandMrp) * 100),
      purpose: `Used for ${category.toLowerCase()}`,
      commonUses: [`Relief from ${category.toLowerCase()}`],
      commonSideEffects: ['Nausea', 'Dizziness', 'Headache'],
      precautions: 'Do not consume with alcohol.',
      foodInteraction: 'Take after meals.',
      storageInstructions: 'Store in a cool, dry place.',
      prescriptionRequired: rxReq,
      alternativeMedicines: [`AltMed${i}-1`, `AltMed${i}-2`],
      medicineImage: `https://via.placeholder.com/150?text=Medicine+${i}`
    });

    // Generate 1-3 Generic Alternatives for this specific branded medicine
    const numGenerics = Math.floor(Math.random() * 3) + 1; // 1 to 3 generics
    for (let j = 1; j <= numGenerics; j++) {
      const genPrice = Math.floor(brandPrice * (Math.random() * 0.4 + 0.1)); // 10% to 50% of brand price (very cheap)
      const genMrp = genPrice + Math.floor(Math.random() * 20);
      const genManufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
      
      medicines.push({
        medicineName: `GenericAlt${j}-${category.replace(' ', '')}${i} ${dosageForm}`,
        genericName,
        composition,
        brandName: `GenericBrand${j}`,
        manufacturer: genManufacturer,
        category,
        dosageForm,
        strength: '500mg',
        price: genPrice,
        mrp: genMrp,
        discount: Math.floor(((genMrp - genPrice) / genMrp) * 100),
        purpose: `Used for ${category.toLowerCase()}`,
        commonUses: [`Relief from ${category.toLowerCase()}`],
        commonSideEffects: ['Nausea', 'Dizziness', 'Headache'],
        precautions: 'Do not consume with alcohol.',
        foodInteraction: 'Take after meals.',
        storageInstructions: 'Store in a cool, dry place.',
        prescriptionRequired: rxReq,
        alternativeMedicines: [],
        medicineImage: `https://via.placeholder.com/150?text=Generic+${i}-${j}`
      });
    }
  }
  
  return medicines;
};

const importData = async () => {
  try {
    await Medicine.deleteMany();
    
    const sampleMedicines = generateDummyMedicines(100);
    
    await Medicine.insertMany(sampleMedicines);
    
    console.log('Medicines Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  // Option to destroy data if needed
  Medicine.deleteMany().then(() => {
    console.log('Data Destroyed!');
    process.exit();
  });
} else {
  importData();
}
