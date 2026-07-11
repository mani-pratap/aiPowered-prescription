import axios from 'axios';

const API_URL = '/api/medicines/';

// Helper to get auth token
const getAuthHeaders = () => {
  const userInfo = localStorage.getItem('userInfo');
  let token = '';
  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
      token = parsed.token || '';
    } catch (e) {
      console.error('Error parsing userInfo from localStorage', e);
    }
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Create a new medicine
const createMedicine = async (medicineData) => {
  const response = await axios.post(API_URL, medicineData, getAuthHeaders());
  return response.data;
};

// Get all medicines with pagination, search, filter
const getMedicines = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axios.get(`${API_URL}?${queryString}`);
  return response.data;
};

// Get single medicine by id
const getMedicineById = async (id) => {
  const response = await axios.get(`${API_URL}${id}`);
  return response.data;
};

// Update medicine
const updateMedicine = async (id, medicineData) => {
  const response = await axios.put(`${API_URL}${id}`, medicineData, getAuthHeaders());
  return response.data;
};

// Delete medicine
const deleteMedicine = async (id) => {
  const response = await axios.delete(`${API_URL}${id}`, getAuthHeaders());
  return response.data;
};

const medicineService = {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
};

export default medicineService;
