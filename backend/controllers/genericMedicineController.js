import Medicine from '../models/Medicine.js';
import { generateGenericAlternatives as generateAIAlternatives } from '../services/geminiAnalysisService.js';

// @desc    Get generic alternatives for a medicine
// @route   GET /api/generic/:medicineName
// @access  Public
export const getGenericAlternatives = async (req, res) => {
  try {
    const { medicineName } = req.params;

    // 1. Find the target medicine
    const targetMedicine = await Medicine.findOne({
      $or: [
        { medicineName: { $regex: new RegExp('^' + medicineName + '$', 'i') } },
        { medicineName: { $regex: medicineName, $options: 'i' } },
        { brandName: { $regex: medicineName, $options: 'i' } } // also search by brandName
      ]
    });

    if (!targetMedicine) {
      // AI FALLBACK
      try {
        const aiData = await generateAIAlternatives(medicineName);
        return res.json(aiData);
      } catch (aiError) {
        return res.status(404).json({ message: 'Medicine not found in DB and AI fallback failed' });
      }
    }

    // 2. Find generic alternatives based on genericName or composition
    // Exclude the target medicine itself
    let genericQuery = { _id: { $ne: targetMedicine._id } };
    
    if (targetMedicine.genericName) {
      genericQuery.$or = [
        { genericName: targetMedicine.genericName },
        { composition: targetMedicine.composition }
      ];
    } else {
      genericQuery.composition = targetMedicine.composition;
    }

    // Sort by price to show cheapest generics first
    const alternatives = await Medicine.find(genericQuery).sort({ price: 1 }).limit(10);

    // Calculate price comparison for each alternative
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

    res.json({
      targetMedicine,
      alternatives: comparisonResults
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
