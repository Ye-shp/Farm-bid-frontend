import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; 

const token = localStorage.getItem('token'); // Add token retrieval for authenticated routes

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${token}`, // Include token in headers
  },
});

// User registration
export const register = (data) => 
  api.post('/auth/register', data)
    .catch(error => {
      console.error("Error in register API:", error);
      throw error;
    });

// User login
export const login = (data) => 
  api.post('/auth/login', data)
    .catch(error => {
      console.error("Error in login API:", error);
      throw error;
    });

// Fetch all products
export const getProducts = () => 
  api.get('/products')
    .catch(error => {
      console.error("Error in fetching products:", error);
      throw error;
    });

// Fetch a single product by ID
export const getProduct = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error in fetching product:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Place a bid on a product
export const placeBid = async (id, data) => {
  try {
    const response = await api.post(`/products/${id}/bids`, data);
    return response.data;
  } catch (error) {
    console.error("Error in placing bid:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Create a new auction
export const createAuction = async (data) => {
  try {
    const response = await api.post('/auctions/create', data);
    return response.data;
  } catch (error) {
    console.error("Error in creating auction:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Create a new product
export const createProduct = async (data) => {
  try {
    const response = await api.post('/products', data);
    return response.data;
  } catch (error) {
    console.error("Error in creating product:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export default api;
