import DiseaseAnalysis from '../models/DiseaseAnalysis.js';
import Prescription from '../models/Prescription.js';
import Medicine from '../models/Medicine.js';
import { generateDiseaseAnalysis } from '../services/geminiAnalysisService.js';

// @desc    Generate Disease Analysis for a Prescription
// @route   POST /api/disease-analysis/:prescriptionId
// @access  Private
export const generateAnalysis = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    // Check if analysis already exists
    let existingAnalysis = await DiseaseAnalysis.findOne({ prescription: prescriptionId });
    if (existingAnalysis) {
      return res.status(200).json(existingAnalysis);
    }

    // 1. Fetch Prescription
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Ensure prescription belongs to logged in user or admin (skip strict check per prompt rules to not modify auth, but just ensure it exists)
    // 2. Fetch Medicine Info from Database
    const medicineNames = prescription.structuredData?.medicines?.map(m => m.medicineName) || [];
    
    // We will find medicines that match the names (using regex or simple include)
    // To keep it simple and robust, we fetch all medicines that might match
    const medicineData = [];
    for (const name of medicineNames) {
      if (!name) continue;
      // Search for medicine containing the name (case insensitive)
      const meds = await Medicine.find({ 
        $or: [
          { medicineName: { $regex: name, $options: 'i' } },
          { genericName: { $regex: name, $options: 'i' } }
        ]
      }).limit(1);
      if (meds.length > 0) {
        medicineData.push(meds[0]);
      }
    }

    // 3. Call Gemini Service
    const aiAnalysisArray = await generateDiseaseAnalysis(prescription.structuredData, medicineData);

    if (!Array.isArray(aiAnalysisArray) || aiAnalysisArray.length !== 4) {
      return res.status(500).json({ message: 'Invalid AI response format. Expected 4 languages.' });
    }

    // 4. Save to Database
    const newAnalysis = await DiseaseAnalysis.create({
      prescription: prescriptionId,
      analyses: aiAnalysisArray
    });

    res.status(201).json(newAnalysis);

  } catch (error) {
    console.error('Error generating analysis:', error);
    res.status(500).json({ message: error.message || 'Server Error generating analysis' });
  }
};

// @desc    Get Analysis by Prescription ID
// @route   GET /api/disease-analysis/:prescriptionId
// @access  Private
export const getAnalysis = async (req, res) => {
  try {
    const analysis = await DiseaseAnalysis.findOne({ prescription: req.params.prescriptionId });
    
    if (analysis) {
      res.json(analysis);
    } else {
      res.status(404).json({ message: 'Analysis not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Analysis
// @route   DELETE /api/disease-analysis/:id
// @access  Private
export const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await DiseaseAnalysis.findById(req.params.id);

    if (analysis) {
      await analysis.deleteOne();
      res.json({ message: 'Analysis removed' });
    } else {
      res.status(404).json({ message: 'Analysis not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
