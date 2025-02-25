import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api`; 

// User registration
export const register = (data) => axios.post(`${API_URL}/auth/register`, data);

// User login
export const login = (data) => axios.post(`${API_URL}/auth/login`, data);

// Forgot Password
export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
  return response;
};

// Reset Password
export const resetPassword = async (token, newPassword) => {
  const response = await axios.post(`${API_URL}/auth/reset-password`, { 
    token, 
    newPassword 
  });
  return response;
};

// Get nearby farmers (for buyers)
export const getNearbyFarmers = (location) => {
  return axios.post(`${API_URL}/farmers/nearby`, { location });
};

// Get nearby buyers (for farmers)
export const getNearbyBuyers = (location) => {
  return axios.post(`${API_URL}/buyers/nearby`, { location });
};

// Featured farms logic 
export const getFeaturedFarms = async () => {
  try {
    const response = await axios.get(`${API_URL}/blogs/featured-farms`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured farms:', error);
    throw error;
  }
};

export const createAuctionTransaction = (auctionId) => 
  axios.post(`${API_URL}/transactions/auction`, { auctionId });

export const createContractTransaction = (contractId) => 
  axios.post(`${API_URL}/transactions/contract`, { contractId });

// Updated payout endpoints:
export const createPaymentIntent = (data) => axios.post(`${API_URL}/payments/create-payment-intent`, data);

// NOTE: Updated endpoint from "/payout/request" to "/payout/create-payout"
export const requestPayout = (data) => axios.post(`${API_URL}/payout/create-payout`, data);

// The connected account and bank account endpoints 
export const createConnectedAccount = (data) => axios.post(`${API_URL}/payout/create-connected-account`, data);
export const addBankAccount = (data) => axios.post(`${API_URL}/payout/add-bank-account`, data);

// Added new endpoints for seller balance and transfers (GET requests)
export const getSellerBalance = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_URL}/payout/seller-balance`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getSellerTransfers = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_URL}/payout/seller-transfers`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Export all functions
const api = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getFeaturedFarms,
  getNearbyFarmers,
  getNearbyBuyers,
  createAuctionTransaction,
  createContractTransaction,
  createPaymentIntent,
  requestPayout,
  createConnectedAccount,
  addBankAccount,
  getSellerBalance,
  getSellerTransfers,
};

export default api;
