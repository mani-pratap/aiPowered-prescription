import Prescription from '../models/Prescription.js';
import { analyzeFoodSafety } from '../services/geminiAnalysisService.js';
import sharp from 'sharp';

// @desc    Upload food image and analyze safety
// @route   POST /api/food/analyze
// @access  Private
export const analyzeFood = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a food image.');
    }

    // 1. Fetch user's latest prescription to get medical context
    const latestPrescription = await Prescription.findOne({
      user: req.user._id,
      status: 'completed',
    }).sort({ createdAt: -1 });

    let medicalContext = '';

    if (latestPrescription) {
      // Find the english analysis to extract diseases
      let predictedDisease = "Unknown";
      if (latestPrescription.genericsData && Array.isArray(latestPrescription.genericsData)) {
         // Assuming disease prediction might be in structuredData or we can just extract medicines
      }

      // We don't have the AI disease output saved directly on the Prescription model except if we re-ran it. 
      // Let's use structuredData medicines to build context.
      const meds = latestPrescription.structuredData?.medicines || [];
      const medicineNames = meds.map(m => m.medicineName).filter(Boolean).join(', ');

      if (medicineNames) {
        medicalContext = `The user is currently taking the following medicines: ${medicineNames}. Please determine if the food is safe to eat with these medications, considering common side effects and interactions.`;
      } else {
        medicalContext = `The user has uploaded a prescription previously but no active medicines were parsed. Provide general safety advice.`;
      }
    } else {
      medicalContext = `The user has no recorded medical history or active prescriptions. Provide general health and diet advice regarding this food.`;
    }

    // 2. Process image (compress for Gemini)
    const compressedImageBuffer = await sharp(req.file.buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const imageBase64 = compressedImageBuffer.toString('base64');

    // 3. Send to Gemini
    const safetyAnalysis = await analyzeFoodSafety(imageBase64, 'image/jpeg', medicalContext);

    res.status(200).json({
      success: true,
      data: safetyAnalysis
    });

  } catch (error) {
    console.error("Food Analysis Error:", error);
    next(error);
  }
};
