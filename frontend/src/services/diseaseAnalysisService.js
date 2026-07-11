import api from './api';

const generateAnalysis = async (prescriptionId) => {
  const response = await api.post(`/disease-analysis/${prescriptionId}`);
  return response.data;
};

const getAnalysis = async (prescriptionId) => {
  const response = await api.get(`/disease-analysis/${prescriptionId}`);
  return response.data;
};

const diseaseAnalysisService = {
  generateAnalysis,
  getAnalysis,
};

export default diseaseAnalysisService;
