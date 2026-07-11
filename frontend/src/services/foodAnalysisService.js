import api from './api';

const uploadAndAnalyzeFood = async (formData) => {
  const response = await api.post('/food-analysis', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

const getFoodHistory = async () => {
  const response = await api.get('/food-analysis');
  return response.data.data;
};

const getFoodAnalysisDetails = async (id) => {
  const response = await api.get(`/food-analysis/${id}`);
  return response.data.data;
};

const deleteFoodAnalysis = async (id) => {
  const response = await api.delete(`/food-analysis/${id}`);
  return response.data;
};

const foodAnalysisService = {
  uploadAndAnalyzeFood,
  getFoodHistory,
  getFoodAnalysisDetails,
  deleteFoodAnalysis,
};

export default foodAnalysisService;
