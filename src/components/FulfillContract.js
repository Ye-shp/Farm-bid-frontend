// src/components/FulfillContract.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const FulfillContract = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    quantity: '',
    price: '',
    deliveryMethod: 'buyer_pickup',
    deliveryFee: 0,
    estimatedDeliveryDate: '',
    notes: ''
  });
  const API_URL = process.env.REACT_APP_API_URL

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get(`${API_URL}/api/open-contracts/${contractId}`, config);
        setContract(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching contract details:', error);
        setError('Failed to load contract details. Please try again later.');
        setLoading(false);
      }
    };

    fetchContractDetails();
  }, [contractId, navigate]);

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

      // Calculate delivery fee if farmer is delivering
      if (formData.deliveryMethod === 'farmer_delivery') {
        const userResponse = await axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Get farmer's delivery fee structure
        const { deliveryOptions } = userResponse.data;
        if (deliveryOptions?.deliveryFee) {
          formData.deliveryFee = deliveryOptions.deliveryFee.base +
            (calculateDistance(userResponse.data.address, contract.deliveryAddress) * 
             deliveryOptions.deliveryFee.perMile);
        }
      }

      const response = await axios.post(
        `${API_URL}/api/open-contracts/${contractId}/fulfill`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate('/contracts');
    } catch (error) {
      console.error('Error fulfilling contract:', error);
      setError(error.response?.data?.error || 'Failed to fulfill contract');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
  }

  if (!contract) {
    return <div className="text-center p-4">Contract not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Fulfill Contract</h2>

        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Contract Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Product Type:</p>
              <p>{contract.productType}</p>
            </div>
            <div>
              <p className="font-medium">Category:</p>
              <p>{contract.productCategory}</p>
            </div>
            <div>
              <p className="font-medium">Required Quantity:</p>
              <p>{contract.quantity}</p>
            </div>
            <div>
              <p className="font-medium">Max Price:</p>
              <p>${contract.maxPrice}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="quantity" className="block font-medium mb-1">
              Quantity You Can Provide
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              max={contract.quantity}
              required
              className="w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label htmlFor="price" className="block font-medium mb-1">
              Your Price (per unit)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              max={contract.maxPrice}
              step="0.01"
              required
              className="w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label htmlFor="deliveryMethod" className="block font-medium mb-1">
              Delivery Method
            </label>
            <select
              id="deliveryMethod"
              name="deliveryMethod"
              value={formData.deliveryMethod}
              onChange={handleInputChange}
              required
              className="w-full border rounded-md p-2"
            >
              <option value="buyer_pickup">Buyer Pickup</option>
              <option value="farmer_delivery">Farmer Delivery</option>
            </select>
          </div>

          {formData.deliveryMethod === 'farmer_delivery' && (
            <div>
              <label htmlFor="estimatedDeliveryDate" className="block font-medium mb-1">
                Estimated Delivery Date
              </label>
              <input
                type="date"
                id="estimatedDeliveryDate"
                name="estimatedDeliveryDate"
                value={formData.estimatedDeliveryDate}
                onChange={handleInputChange}
                required
                className="w-full border rounded-md p-2"
              />
            </div>
          )}

          <div>
            <label htmlFor="notes" className="block font-medium mb-1">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              className="w-full border rounded-md p-2"
              placeholder="Add any additional details about your fulfillment offer..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Submit Fulfillment
            </button>
            <button
              type="button"
              onClick={() => navigate(`/contracts/${contractId}`)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FulfillContract;
