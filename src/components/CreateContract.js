import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const productCategories = {
  Fruit: ['Apples', 'Oranges', 'Bananas', 'Berries', 'Grapes', 'Peaches', 'Mangoes'],
  Vegetable: ['Carrots', 'Tomatoes', 'Potatoes', 'Broccoli', 'Lettuce', 'Cucumbers', 'Peppers'],
  Meat: ['Beef', 'Pork', 'Chicken', 'Lamb', 'Goat'],
  Dairy: ['Milk', 'Cheese', 'Eggs', 'Yogurt', 'Butter'],
  Other: ['Honey', 'Grains', 'Corn', 'Beans', 'Nuts'],
};

const CreateContract = () => {
  const [formData, setFormData] = useState({
    productType: '',
    productCategory: '',
    quantity: '',
    maxPrice: '',
    endTime: '',
    deliveryMethod: 'buyer_pickup',
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    isRecurring: false,
    recurringFrequency: 'monthly',
    recurringEndDate: '',
    recurringPaymentSettings: {
      autoPayEnabled: false,
      paymentMethodId: '',
      notifyBeforeCharge: true,
      notificationDays: 3
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  // Fetch payment methods when component mounts
  useEffect(() => {
    if (formData.isRecurring) {
      fetchPaymentMethods();
    }
  }, [formData.isRecurring]);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/payments/methods`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPaymentMethods(response.data);
      
      // If there's a default payment method, select it
      const defaultMethod = response.data.find(method => method.invoice_settings?.default_payment_method);
      if (defaultMethod) {
        setFormData({
          ...formData,
          recurringPaymentSettings: {
            ...formData.recurringPaymentSettings,
            paymentMethodId: defaultMethod.id
          }
        });
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setError('Failed to load payment methods. Please try again.');
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Get user's address if delivery is required
      if (formData.deliveryMethod !== 'buyer_pickup') {
        const userResponse = await axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        formData.deliveryAddress = userResponse.data.address;
      }

      // Validate recurring contract fields
      if (formData.isRecurring && !formData.recurringEndDate) {
        setError('Recurring end date is required for recurring contracts');
        setLoading(false);
        return;
      }

      // Validate payment method if auto-pay is enabled
      if (formData.isRecurring && formData.recurringPaymentSettings.autoPayEnabled && !formData.recurringPaymentSettings.paymentMethodId) {
        setError('Please select a payment method for automatic payments');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/open-contracts/create`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate('/contracts');
    } catch (error) {
      console.error('Error creating contract:', error);
      setError(error.response?.data?.error || 'Failed to create contract');
    } finally {
      setLoading(false);
    }
  };

  // Get available products based on selected category
  const getAvailableProducts = () => {
    return formData.productCategory ? productCategories[formData.productCategory] || [] : [];
  };

  // Calculate minimum date for recurring end date (must be after initial end time)
  const getMinRecurringEndDate = () => {
    if (!formData.endTime) return '';
    
    const endDate = new Date(formData.endTime);
    // Add one day to ensure it's after the end time
    endDate.setDate(endDate.getDate() + 1);
    return endDate.toISOString().slice(0, 16);
  };

  // Format card details for display
  const formatCardDetails = (card) => {
    return `${card.brand.toUpperCase()} •••• ${card.last4} (Expires ${card.exp_month}/${card.exp_year})`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Create Open Contract</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="productCategory" className="block font-medium">Product Category</label>
            <select
              id="productCategory"
              value={formData.productCategory}
              onChange={(e) => setFormData({ ...formData, productCategory: e.target.value, productType: '' })}
              className="w-full border rounded-md p-2"
              required
            >
              <option value="">Select a category</option>
              {Object.keys(productCategories).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="productType" className="block font-medium">Product Type</label>
            <select
              id="productType"
              value={formData.productType}
              onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
              className="w-full border rounded-md p-2"
              required
              disabled={!formData.productCategory}
            >
              <option value="">Select a product</option>
              {getAvailableProducts().map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="quantity" className="block font-medium">Quantity</label>
            <input
              type="number"
              id="quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full border rounded-md p-2"
              placeholder="Enter quantity in pounds"
              required
              min="1"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="maxPrice" className="block font-medium">Max Price</label>
            <input
              type="number"
              id="maxPrice"
              value={formData.maxPrice}
              onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
              className="w-full border rounded-md p-2"
              placeholder="Enter maximum price per pound"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="endTime" className="block font-medium">End Time</label>
            <input
              type="datetime-local"
              id="endTime"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full border rounded-md p-2"
              required
              min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
              max={new Date(Date.now() + 7 * 24 * 3600000).toISOString().slice(0, 16)}
            />
          </div>

          {/* Recurring Contract Options */}
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isRecurring" className="ml-2 block font-medium">
                Make this a recurring contract
              </label>
            </div>
          </div>

          {formData.isRecurring && (
            <>
              <div className="space-y-2">
                <label htmlFor="recurringFrequency" className="block font-medium">Frequency</label>
                <select
                  id="recurringFrequency"
                  value={formData.recurringFrequency}
                  onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value })}
                  className="w-full border rounded-md p-2"
                  required={formData.isRecurring}
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="recurringEndDate" className="block font-medium">Recurring End Date</label>
                <input
                  type="datetime-local"
                  id="recurringEndDate"
                  value={formData.recurringEndDate}
                  onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                  className="w-full border rounded-md p-2"
                  required={formData.isRecurring}
                  min={getMinRecurringEndDate()}
                  max={new Date(Date.now() + 365 * 24 * 3600000).toISOString().slice(0, 16)} // Max 1 year in the future
                />
              </div>

              {/* Recurring Payment Settings */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Payment Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoPayEnabled"
                      checked={formData.recurringPaymentSettings.autoPayEnabled}
                      onChange={(e) => setFormData({
                        ...formData,
                        recurringPaymentSettings: {
                          ...formData.recurringPaymentSettings,
                          autoPayEnabled: e.target.checked
                        }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoPayEnabled" className="ml-2 block font-medium">
                      Enable automatic payments
                    </label>
                  </div>

                  {formData.recurringPaymentSettings.autoPayEnabled && (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="paymentMethodId" className="block font-medium">Payment Method</label>
                        {loadingPaymentMethods ? (
                          <div className="text-gray-500">Loading payment methods...</div>
                        ) : paymentMethods.length === 0 ? (
                          <div className="text-red-500">
                            No payment methods found. Please add a payment method in your profile.
                          </div>
                        ) : (
                          <select
                            id="paymentMethodId"
                            value={formData.recurringPaymentSettings.paymentMethodId}
                            onChange={(e) => setFormData({
                              ...formData,
                              recurringPaymentSettings: {
                                ...formData.recurringPaymentSettings,
                                paymentMethodId: e.target.value
                              }
                            })}
                            className="w-full border rounded-md p-2"
                            required={formData.recurringPaymentSettings.autoPayEnabled}
                          >
                            <option value="">Select a payment method</option>
                            {paymentMethods.map((method) => (
                              <option key={method.id} value={method.id}>
                                {method.card ? formatCardDetails(method.card) : method.id}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="notifyBeforeCharge"
                          checked={formData.recurringPaymentSettings.notifyBeforeCharge}
                          onChange={(e) => setFormData({
                            ...formData,
                            recurringPaymentSettings: {
                              ...formData.recurringPaymentSettings,
                              notifyBeforeCharge: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="notifyBeforeCharge" className="ml-2 block font-medium">
                          Notify me before charging
                        </label>
                      </div>

                      {formData.recurringPaymentSettings.notifyBeforeCharge && (
                        <div className="space-y-2">
                          <label htmlFor="notificationDays" className="block font-medium">Days before charge to notify</label>
                          <select
                            id="notificationDays"
                            value={formData.recurringPaymentSettings.notificationDays}
                            onChange={(e) => setFormData({
                              ...formData,
                              recurringPaymentSettings: {
                                ...formData.recurringPaymentSettings,
                                notificationDays: parseInt(e.target.value)
                              }
                            })}
                            className="w-full border rounded-md p-2"
                          >
                            <option value="1">1 day</option>
                            <option value="2">2 days</option>
                            <option value="3">3 days</option>
                            <option value="5">5 days</option>
                            <option value="7">7 days</option>
                          </select>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label htmlFor="deliveryMethod" className="block font-medium">Delivery Method</label>
            <select
              id="deliveryMethod"
              value={formData.deliveryMethod}
              onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })}
              className="w-full border rounded-md p-2"
              required
            >
              <option value="buyer_pickup">Buyer Pickup</option>
              <option value="farmer_delivery">Farmer Delivery</option>
              <option value="third_party">Third Party Delivery</option>
            </select>
          </div>

          {formData.deliveryMethod !== 'buyer_pickup' && (
            <div>
              <h3 className="text-lg font-bold mb-2">Delivery Address</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="street" className="block font-medium">Street</label>
                  <input
                    type="text"
                    id="street"
                    value={formData.deliveryAddress.street}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliveryAddress: { ...formData.deliveryAddress, street: e.target.value }
                    })}
                    className="w-full border rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block font-medium">City</label>
                  <input
                    type="text"
                    id="city"
                    value={formData.deliveryAddress.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliveryAddress: { ...formData.deliveryAddress, city: e.target.value }
                    })}
                    className="w-full border rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block font-medium">State</label>
                  <input
                    type="text"
                    id="state"
                    value={formData.deliveryAddress.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliveryAddress: { ...formData.deliveryAddress, state: e.target.value }
                    })}
                    className="w-full border rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="block font-medium">Zip Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    value={formData.deliveryAddress.zipCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliveryAddress: { ...formData.deliveryAddress, zipCode: e.target.value }
                    })}
                    className="w-full border rounded-md p-2"
                    required
                    pattern="[0-9]{5}"
                    title="Five digit zip code"
                  />
                </div>
              </div>
            </div>
          )}
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white text-lg font-semibold rounded-lg py-3 px-6 mt-6 hover:bg-blue-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Contract'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateContract;
