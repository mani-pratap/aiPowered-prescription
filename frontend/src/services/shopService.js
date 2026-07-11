import api from './api';

const getShopMedicines = async (query = '') => {
  const response = await api.get(`/shop/medicines${query}`);
  return response.data;
};

const getMedicineById = async (id) => {
  const response = await api.get(`/shop/medicine/${id}`);
  return response.data;
};

const shopService = {
  getShopMedicines,
  getMedicineById,
};

export default shopService;
