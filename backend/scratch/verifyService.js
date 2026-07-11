import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { extractPrescriptionData } from '../services/ocrService.js';

dotenv.config();

const run = async () => {
  try {
    const imagePath = path.join(process.cwd(), 'scratch', 'handwritten_prescription.png');
    const imageBuffer = fs.readFileSync(imagePath);
    console.log("Calling extractPrescriptionData with local image buffer...");
    const result = await extractPrescriptionData(imageBuffer);
    console.log("Result structuredData:", JSON.stringify(result.structuredData, null, 2));
    console.log("Result rawOcrText:", result.rawOcrText);
  } catch (err) {
    console.error("Integration verification failed:", err);
  }
};

run();
