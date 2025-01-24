import api from './api';

const paymentService = {
  /**
   * Create a payment intent
   */
  createPaymentIntent: async (data) => {
    const token = localStorage.getItem('token');
    const response = await api.post('/payment/create-intent', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Get transaction details
   */
  getTransaction: async (transactionId) => {
    const token = localStorage.getItem('token');
    const response = await api.get(`/payment/transaction/${transactionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Process payout for a transaction
   */
  processPayout: async (transactionId) => {
    const token = localStorage.getItem('token');
    const response = await api.post(`/payment/process-payout/${transactionId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Get seller balance and payout history
   */
  getSellerBalance: async () => {
    const token = localStorage.getItem('token');
    const response = await api.get('/seller/balance', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Get seller transfers (completed and pending)
   */
  getSellerTransfers: async () => {
    const token = localStorage.getItem('token');
    const response = await api.get('/seller/transfers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Create a connected account for payouts
   */
  createConnectedAccount: async (data) => {
    const token = localStorage.getItem('token');
    const response = await api.post('/seller/account', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Add a bank account to connected account
   */
  addBankAccount: async (data) => {
    const token = localStorage.getItem('token');
    const response = await api.post('/seller/bank-account', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Request a payout
   */
  requestPayout: async (data) => {
    const token = localStorage.getItem('token');
    const response = await api.post('/seller/payout', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Calculate display amounts including fees
   */
  calculateDisplayAmounts(amount) {
    const PLATFORM_FEE_PERCENTAGE = 0.05; // 5%
    const PROCESSING_FEE_PERCENTAGE = 0.029; // 2.9%
    const PROCESSING_FEE_FIXED = 0.30; // $0.30

    const platformFee = amount * PLATFORM_FEE_PERCENTAGE;
    const processingFee = (amount * PROCESSING_FEE_PERCENTAGE) + PROCESSING_FEE_FIXED;
    const totalFees = platformFee + processingFee;
    
    return {
      subtotal: amount,
      platformFee,
      processingFee,
      total: amount + totalFees,
      fees: {
        platform: platformFee,
        processing: processingFee
      }
    };
  }
};

export default paymentService;
