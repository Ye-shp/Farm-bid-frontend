import React, { useState } from 'react';
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
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = 'https://farm-bid.onrender.com';

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
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : 'Create Contract'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateContract;
