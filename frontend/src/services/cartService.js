import api from './api';

const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

const addToCart = async (medicineId, quantity = 1) => {
  const response = await api.post('/cart', { medicineId, quantity });
  window.dispatchEvent(new Event('cartUpdated'));
  return response.data;
};

const updateCartItem = async (id, quantity) => {
  const response = await api.put(`/cart/${id}`, { quantity });
  window.dispatchEvent(new Event('cartUpdated'));
  return response.data;
};

const removeFromCart = async (id) => {
  const response = await api.delete(`/cart/${id}`);
  window.dispatchEvent(new Event('cartUpdated'));
  return response.data;
};

const clearCart = async () => {
  const response = await api.delete('/cart');
  window.dispatchEvent(new Event('cartUpdated'));
  return response.data;
};

const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};

export default cartService;
