import FoodAnalysis from '../models/FoodAnalysis.js';
import DiseaseAnalysis from '../models/DiseaseAnalysis.js';
import Prescription from '../models/Prescription.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.js';
import { analyzeFoodImage } from '../services/geminiAnalysisService.js';
import sharp from 'sharp';

// @desc    Upload food image and analyze
// @route   POST /api/food-analysis
// @access  Private
export const uploadAndAnalyzeFood = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a food image.' });
    }

    // 1. Fetch latest disease analysis context for the user
    // We assume the most recent prescription analysis is their current state
    const latestDiseaseAnalysis = await DiseaseAnalysis.findOne({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('prescription');

    let diseaseData = null;
    let medicineData = null;

    if (latestDiseaseAnalysis) {
      diseaseData = latestDiseaseAnalysis.analyses.find(a => a.language === 'English') || latestDiseaseAnalysis.analyses[0];
      if (latestDiseaseAnalysis.prescription) {
        medicineData = latestDiseaseAnalysis.prescription.structuredData?.medicines;
      }
    }

    // 2. Compress Image
    const compressedImageBuffer = await sharp(req.file.buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // 3. Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(compressedImageBuffer);

    // 4. Send to Gemini
    const aiData = await analyzeFoodImage(compressedImageBuffer, diseaseData, medicineData);

    // 5. Store in DB
    const foodAnalysis = await FoodAnalysis.create({
      user: req.user._id,
      diseaseAnalysis: latestDiseaseAnalysis ? latestDiseaseAnalysis._id : null,
      imageUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      foodName: aiData.foodName,
      foodCategory: aiData.foodCategory,
      confidence: aiData.confidence,
      recommendation: aiData.recommendation,
      reason: aiData.reason,
      medicineInteraction: aiData.medicineInteraction,
      healthierAlternatives: aiData.healthierAlternatives,
      tips: aiData.tips,
      rawGeminiResponse: aiData
    });

    res.status(201).json({
      success: true,
      message: 'Food analyzed successfully',
      data: foodAnalysis
    });

  } catch (error) {
    console.error("Food Analysis Error:", error);
    res.status(500).json({ message: error.message || 'Failed to process food image' });
  }
};

// @desc    Get all food history
// @route   GET /api/food-analysis
// @access  Private
export const getFoodHistory = async (req, res, next) => {
  try {
    const history = await FoodAnalysis.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single food analysis
// @route   GET /api/food-analysis/:id
// @access  Private
export const getFoodAnalysisDetails = async (req, res, next) => {
  try {
    const analysis = await FoodAnalysis.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Food analysis not found' });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete food analysis
// @route   DELETE /api/food-analysis/:id
// @access  Private
export const deleteFoodAnalysis = async (req, res, next) => {
  try {
    const analysis = await FoodAnalysis.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Food analysis not found' });
    }

    if (analysis.cloudinaryPublicId) {
      await deleteFromCloudinary(analysis.cloudinaryPublicId);
    }

    await analysis.deleteOne();

    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    next(error);
  }
};
