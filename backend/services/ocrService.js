import Tesseract from 'tesseract.js';

/**
 * Extracts raw OCR text from an image URL using Tesseract.js
 * @param {string} imageUrl - The URL of the image on Cloudinary
 * @returns {Promise<string>} - The raw extracted text
 */
export const extractPrescriptionData = async (imageUrl) => {
  try {
    console.log("Starting Tesseract.js OCR for:", imageUrl);
    const result = await Tesseract.recognize(
      imageUrl,
      'eng',
      { logger: m => console.log(m) } // Optional: logs progress
    );
    
    console.log("Tesseract OCR completed successfully.");
    return result.data.text;
  } catch (error) {
    console.error("Tesseract OCR Error:", error.message || error);
    throw new Error("OCR extraction failed");
  }
};
