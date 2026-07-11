import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EasyOCR } from 'node-easyocr';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const extractPrescriptionData = async (imageBuffer) => {
  const ocr = new EasyOCR();
  const tempFilePath = path.join(os.tmpdir(), `temp_prescription_${Date.now()}.png`);

  try {
    // Write buffer to a temporary file
    fs.writeFileSync(tempFilePath, imageBuffer);

    console.log('Initializing EasyOCR...');
    await ocr.init(['en']);
    
    console.log(`Processing image with EasyOCR...`);
    const result = await ocr.readText(tempFilePath);
    
    let allText = "";
    if (result && Array.isArray(result)) {
      allText = result.map(item => item.text).join('\n');
    }

    // Because EasyOCR is a local OCR model and doesn't output structured JSON,
    // we'll put the raw extracted text into the additionalNotes field so it shows up in the frontend UI,
    // and we'll still save it as rawOcrText.
    return {
      structuredData: {
        doctor: { name: "", hospital: "", address: "", phone: "" },
        patient: { name: "", age: "", gender: "" },
        prescriptionDate: "",
        medicines: [],
        additionalNotes: allText || "No readable text found."
      },
      rawOcrText: allText 
    };
  } catch (error) {
    console.error("EasyOCR Extraction Error:", error.message || error);
    throw new Error(`OCR Extraction Failed: ${error.message}`);
  } finally {
    try {
      await ocr.close();
    } catch (e) {
      console.error("Error closing EasyOCR:", e);
    }
    // Clean up temp file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
};
