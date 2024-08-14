// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://farm-bid-2dd5bc2872dd.herokuapp.com/api';

const api = axios.create({
  baseURL: API_URL,
});

export const login = (data) => api.post('/login', data);
export const register = (data) => api.post('/register', data);
export const getProducts = () => api.get('/products');
export const getProduct = (id) => api.get(`/products/${id}`);
export const placeBid = (id, data) => api.post(`/products/${id}/bids`, data);

export default api;
