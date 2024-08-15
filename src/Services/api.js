// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Adjust as needed

const api = axios.create({
  baseURL: API_URL,
});

export const register = (data) => 
  api.post('/auth/register', data)
    .catch(error => {
      console.error("Error in register API:", error);
      throw error;
    });

export const login = (data) => 
  api.post('/auth/login', data)
    .catch(error => {
      console.error("Error in login API:", error);
      throw error;
    });

export const getProducts = () => 
  api.get('/products')
    .catch(error => {
      console.error("Error in fetching products:", error);
      throw error;
    });

export const getProduct = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error in fetching product:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const placeBid = async (id, data) => {
  try {
    const response = await api.post(`/products/${id}/bids`, data);
    return response.data;
  } catch (error) {
    console.error("Error in placing bid:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export default api;
