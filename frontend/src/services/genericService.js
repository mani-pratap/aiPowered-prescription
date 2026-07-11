import api from './api';

const getGenericAlternatives = async (medicineName) => {
  const response = await api.get(`/generic/${medicineName}`);
  return response.data;
};

const genericService = {
  getGenericAlternatives,
};

export default genericService;
