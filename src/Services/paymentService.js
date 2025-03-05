const API_URL = process.env.REACT_APP_API_URL;

const paymentService = {
  /**
   * Create a payment intent
   */
  createPaymentIntent: async (data) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/api/payments/create-intent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );
    return response.json();
  },

  /**
   * Get transaction details
   */
  getTransaction: async (transactionId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/api/payments/transaction/${transactionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.json();
  },

  /**
   * Process payout for a transaction
   */
  processPayout: async (transactionId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/api/payments/process-payout/${transactionId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.json();
  },

  /**
   * Get seller balance and payout history
   */
  getSellerBalance: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(
      `${API_URL}/api/payments/balance`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw {
        message: data.error || 'Failed to fetch balance',
        status: response.status,
        response: data
      };
    }
    
    return data;
  },

  /**
   * Get seller transfers (completed and pending)
   */
  getSellerTransfers: async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/api/payments/transfers`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.json();
  },

  /**
   * Create a connected account for payouts
   */
  createConnectedAccount: async (data) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(
      `${API_URL}/api/payments/create-connected-account`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    const responseData = await response.json();
    
    if (!response.ok) {
      throw {
        message: responseData.error || 'Failed to create connected account',
        status: response.status,
        response: responseData
      };
    }
    
    return responseData;
  },

  /**
   * Add a bank account to connected account
   */
  addBankAccount: async (data) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/api/payments/add-bank-account`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );
    return response.json();
  },

  /**
   * Request a payout
   */
  requestPayout: async (data) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/api/payments/request-payout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );
    return response.json();
  },

  /**
   * Calculate display amounts including fees
   */
  calculateDisplayAmounts(amount) {
    const PLATFORM_FEE_PERCENTAGE = 0.05; // 5%
    const PROCESSING_FEE_PERCENTAGE = 0.029; // 2.9%
    const PROCESSING_FEE_FIXED = 0.3; // $0.30

    const platformFee = amount * PLATFORM_FEE_PERCENTAGE;
    const processingFee =
      amount * PROCESSING_FEE_PERCENTAGE + PROCESSING_FEE_FIXED;
    const totalFees = platformFee + processingFee;

    return {
      subtotal: amount,
      platformFee,
      processingFee,
      total: amount + totalFees,
      fees: {
        platform: platformFee,
        processing: processingFee,
      },
    };
  },
};

export default paymentService;
