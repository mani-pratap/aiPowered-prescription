import api from './api';

const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

const orderService = {
  createOrder,
  getOrders,
  getOrderById,
};

export default orderService;
