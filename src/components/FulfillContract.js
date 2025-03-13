// src/components/FulfillContract.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LocationOnIcon from '@mui/icons-material/LocationOn';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      await axios.post(
        `${API_URL}/api/open-contracts/${contractId}/fulfill`,
        formData,
        config
      );

      navigate(`/contracts/${contractId}`);
    } catch (error) {
      console.error('Error fulfilling contract:', error);
      setError('Failed to fulfill contract. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading contract details...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!contract) {
    return <div>Contract not found.</div>;
  }

  // Format address helper function
  const formatAddress = (address) => {
    if (!address) return "No address provided";
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

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

        {/* Buyer Location Information */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center">
            <LocationOnIcon style={{ marginRight: '8px', color: '#1976d2' }} />
            Buyer Location
          </h3>
          <p>
            {contract.buyerLocation ? 
              formatAddress(contract.buyerLocation.address) : 
              formatAddress(contract.buyer.address)}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Price Per Unit</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              min="0.01"
              max={contract.maxPrice}
              step="0.01"
            />
            <p className="text-sm text-gray-500 mt-1">Maximum allowed: ${contract.maxPrice}</p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Delivery Method</label>
            <select
              name="deliveryMethod"
              value={formData.deliveryMethod}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="buyer_pickup">Buyer Pickup</option>
              <option value="farmer_delivery">Farmer Delivery</option>
              <option value="third_party">Third Party Delivery</option>
            </select>
          </div>

          {formData.deliveryMethod !== 'buyer_pickup' && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Delivery Fee</label>
              <input
                type="number"
                name="deliveryFee"
                value={formData.deliveryFee}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                min="0"
                step="0.01"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Estimated Delivery Date</label>
            <input
              type="date"
              name="estimatedDeliveryDate"
              value={formData.estimatedDeliveryDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows="3"
            ></textarea>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate(`/contracts/${contractId}`)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FulfillContract;
