import Prescription from '../models/Prescription.js';
import { uploadToCloudinary } from '../services/cloudinary.js';
import { extractPrescriptionData } from '../services/ocrService.js';
import sharp from 'sharp';

import crypto from 'crypto';

// @desc    Upload prescription and run OCR
// @route   POST /api/prescription/upload
// @access  Private
export const uploadPrescription = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an image file.');
    }

    // Calculate hash to prevent duplicate AI token usage
    const imageHash = crypto.createHash('md5').update(req.file.buffer).digest('hex');

    // Check if user already uploaded this exact image successfully
    const existingPrescription = await Prescription.findOne({
      user: req.user._id,
      imageHash: imageHash,
      status: 'completed'
    });

    if (existingPrescription) {
      console.log('Duplicate prescription detected. Returning cached data.');
      return res.status(200).json({
        success: true,
        message: 'Prescription already processed.',
        data: {
          prescriptionId: existingPrescription._id,
          imageUrl: existingPrescription.imageUrl,
          ocrData: existingPrescription.structuredData,
        }
      });
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
      imageHash: imageHash
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
    const prescriptions = await Prescription.find({ 
      user: req.user._id,
      status: { $ne: 'failed' } 
    }).sort({ createdAt: -1 });

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

import Medicine from '../models/Medicine.js';
import { generateGenericAlternatives as generateAIAlternatives } from '../services/geminiAnalysisService.js';

export const getPrescriptionGenerics = async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!prescription) {
      res.status(404);
      throw new Error('Prescription not found');
    }

    // Return cached generics data if it exists
    if (prescription.genericsData && Array.isArray(prescription.genericsData) && prescription.genericsData.length > 0) {
      return res.json({
        success: true,
        data: prescription.genericsData,
        cached: true
      });
    }

    const meds = prescription?.structuredData?.medicines || [];
    const results = [];

    // Process each medicine sequentially to avoid rate limits
    for (const med of meds) {
      if (!med.medicineName) continue;
      
      const medicineName = med.medicineName;
      let finalData = null;

      try {
        // 1. Search in local DB
        let targetMedicine = await Medicine.findOne({
          $or: [
            { medicineName: { $regex: new RegExp('^' + medicineName + '$', 'i') } },
            { medicineName: { $regex: medicineName, $options: 'i' } },
            { brandName: { $regex: medicineName, $options: 'i' } }
          ]
        });

        let dbAlternatives = [];
        let fetchedFromDB = false;

        if (targetMedicine) {
          // Found in DB, get generics
          let genericQuery = { _id: { $ne: targetMedicine._id } };
          
          if (targetMedicine.genericName) {
            genericQuery.$or = [
              { genericName: targetMedicine.genericName },
              { composition: targetMedicine.composition }
            ];
          } else {
            genericQuery.composition = targetMedicine.composition;
          }

          dbAlternatives = await Medicine.find(genericQuery).sort({ price: 1 }).limit(10);
          if (dbAlternatives.length > 0) {
            fetchedFromDB = true;
          }
        }

        if (!fetchedFromDB) {
          // AI FALLBACK (either not in DB at all, or in DB but no alternatives)
          const aiData = await generateAIAlternatives(medicineName);
          
          if (!targetMedicine) {
            // Save target medicine to DB if it didn't exist
            targetMedicine = await Medicine.create({
              medicineName: aiData.targetMedicine.medicineName,
              genericName: aiData.targetMedicine.medicineName,
              composition: aiData.targetMedicine.composition,
              manufacturer: aiData.targetMedicine.manufacturer,
              category: "General",
              price: aiData.targetMedicine.price,
            });
          }

          // Save AI alternatives to DB
          const comparisonResults = [];
          for (let alt of aiData.alternatives) {
            const savedAlt = await Medicine.create({
              medicineName: alt.medicineName,
              genericName: alt.medicineName,
              composition: alt.composition,
              manufacturer: alt.manufacturer,
              category: "General",
              price: alt.price,
            });

            comparisonResults.push({
              ...savedAlt.toObject(),
              _id: savedAlt._id, // Ensure real MongoDB ID is exposed to frontend
              comparison: alt.comparison,
            });
          }

          finalData = {
            targetMedicine: typeof targetMedicine.toObject === 'function' ? targetMedicine.toObject() : targetMedicine,
            alternatives: comparisonResults
          };
        } else {
          // Successfully fetched from DB
          const comparisonResults = dbAlternatives.map(alt => {
            const discount = targetMedicine.price - alt.price;
            const savingsPercentage = targetMedicine.price > 0 ? ((discount / targetMedicine.price) * 100).toFixed(2) : 0;
            
            return {
              ...alt.toObject(),
              comparison: {
                brandPrice: targetMedicine.price,
                genericPrice: alt.price,
                savings: discount > 0 ? discount : 0,
                savingsPercentage: discount > 0 ? Number(savingsPercentage) : 0,
              }
            };
          });

          finalData = {
            targetMedicine,
            alternatives: comparisonResults
          };
        }
      } catch (err) {
        console.error("Error processing medicine:", medicineName, err);
        // Fallback placeholder
        finalData = {
          targetMedicine: {
            medicineName: medicineName,
            composition: "Unknown Composition",
            manufacturer: "Unknown",
            price: 0
          },
          alternatives: [],
          failed: true
        };
      }
      
      results.push(finalData);
    }

    // Save back to DB
    prescription.genericsData = results;
    await prescription.save();

    res.json({
      success: true,
      data: results,
      cached: false
    });

  } catch (error) {
    next(error);
  }
};

