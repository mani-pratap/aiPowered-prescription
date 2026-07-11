import Prescription from '../models/Prescription.js';
import { uploadToCloudinary } from '../services/cloudinary.js';
import { extractPrescriptionData } from '../services/ocrService.js';
import sharp from 'sharp';

// @desc    Upload prescription and run OCR
// @route   POST /api/prescription/upload
// @access  Private
export const uploadPrescription = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an image file.');
    }

    // Compress image
    const compressedImageBuffer = await sharp(req.file.buffer)
      .resize({ width: 800, withoutEnlargement: true }) 
      .webp({ quality: 60 }) 
      .toBuffer();

    // Create DB entry as processing
    const prescription = await Prescription.create({
      user: req.user._id,
      imageUrl: 'pending', // Temporary
      status: 'processing',
    });

    try {
      // 1. Upload to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(compressedImageBuffer);
      console.log("cloudinaryResult", cloudinaryResult);

      // 2. Run OCR (node-easyocr via Buffer)
      const aiData = await extractPrescriptionData(compressedImageBuffer);

      // 3. Update database
      prescription.imageUrl = cloudinaryResult.secure_url;
      prescription.rawOcrText = aiData.rawOcrText;
      prescription.structuredData = aiData.structuredData;
      prescription.status = 'completed';
      await prescription.save();

      res.status(201).json({
        success: true,
        message: 'Prescription processed successfully.',
        data: {
          prescriptionId: prescription._id,
          imageUrl: prescription.imageUrl,
          ocrData: prescription.structuredData,
        }
      });
    } catch (processError) {
      prescription.status = 'failed';
      await prescription.save();
      throw processError;
    }

  } catch (error) {
    console.error("AI Extraction Error:", error);
    next(error);
  }
};

// @desc    Get single prescription by ID
// @route   GET /api/prescription/:id
// @access  Private
export const getPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!prescription) {
      res.status(404);
      throw new Error('Prescription not found');
    }

    res.json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all prescriptions for user
// @route   GET /api/prescription/history
// @access  Private
export const getPrescriptionHistory = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete prescription
// @route   DELETE /api/prescription/:id
// @access  Private
export const deletePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!prescription) {
      res.status(404);
      throw new Error('Prescription not found');
    }

    await prescription.deleteOne();

    res.json({
      success: true,
      message: 'Prescription removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
