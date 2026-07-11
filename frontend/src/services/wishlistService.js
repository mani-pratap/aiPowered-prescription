import api from './api';

const getWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

const toggleWishlist = async (medicineId) => {
  const response = await api.post('/wishlist', { medicineId });
  return response.data;
};

const wishlistService = {
  getWishlist,
  toggleWishlist,
};

export default wishlistService;
