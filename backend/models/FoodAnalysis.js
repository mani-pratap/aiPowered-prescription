import mongoose from 'mongoose';

const foodAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  diseaseAnalysis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiseaseAnalysis',
  },
  imageUrl: {
    type: String,
    required: true,
  },
  cloudinaryPublicId: {
    type: String,
  },
  foodName: {
    type: String,
    required: true,
  },
  foodCategory: {
    type: String,
  },
  confidence: {
    type: String,
  },
  recommendation: {
    type: String, // "Eat", "Eat in Moderation", "Avoid"
    required: true,
  },
  reason: {
    type: String,
  },
  medicineInteraction: {
    type: String,
  },
  healthierAlternatives: {
    type: [String],
  },
  tips: {
    type: Object, // { english, hindi, telugu, tamil }
  },
  rawGeminiResponse: {
    type: Object,
  }
}, { timestamps: true });

export default mongoose.model('FoodAnalysis', foodAnalysisSchema);
