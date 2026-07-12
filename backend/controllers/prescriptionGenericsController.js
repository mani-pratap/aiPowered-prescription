// This function fetches generics for all medicines in a prescription.
// If already generated, it returns from cache (genericsData).
// If not, it generates it and stores it in the DB.

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
    if (prescription.genericsData && Array.isArray(prescription.genericsData)) {
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
        const targetMedicine = await Medicine.findOne({
          $or: [
            { medicineName: { $regex: new RegExp('^' + medicineName + '$', 'i') } },
            { medicineName: { $regex: medicineName, $options: 'i' } },
            { brandName: { $regex: medicineName, $options: 'i' } }
          ]
        });

        if (!targetMedicine) {
          // AI FALLBACK
          const aiData = await generateAIAlternatives(medicineName);
          finalData = aiData;
        } else {
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

          const alternatives = await Medicine.find(genericQuery).sort({ price: 1 }).limit(10);
          
          const comparisonResults = alternatives.map(alt => {
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
