import axios from 'axios';

const API_URL = 'https://farm-bid-3998c30f5108.herokuapp.com/api'; 
// User registration
export const register = (data) => axios.post(`${API_URL}/auth/register`, data);

// User login
export const login = (data) => axios.post(`${API_URL}/auth/login`, data);

// Get nearby farmers (for buyers)
export const getNearbyFarmers = (location) => {
  return axios.post(`${API_URL}/farmers/nearby`, { location });
};

// Get nearby buyers (for farmers)
export const getNearbyBuyers = (location) => {
  return axios.post(`${API_URL}/buyers/nearby`, { location });
};

export default {
  register,
  login,
 // getNearbyFarmers, for future use 
 // getNearbyBuyers, for future use
};
