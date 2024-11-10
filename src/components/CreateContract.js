import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateContract = () => {
  const [productType, setProductType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const navigate = useNavigate();
  const API_URL = 'https://farm-bid-3998c30f5108.herokuapp.com'; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const requestData = {
        productType,
        quantity,
        maxPrice,
        endTime,
      };

      const response = await axios.post(`${API_URL}/api/open-contracts/create`, requestData, config);
      if (response.status === 201) {
        navigate('/contracts');
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      alert('Failed to create contract. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Create Open Contract</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="productType" className="block font-medium">Product Type</label>
            <input
              type="text"
              id="productType"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full border rounded-md p-2"
              placeholder="Enter product type"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="quantity" className="block font-medium">Quantity</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border rounded-md p-2"
              placeholder="Enter quantity"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="maxPrice" className="block font-medium">Max Price</label>
            <input
              type="number"
              id="maxPrice"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full border rounded-md p-2"
              placeholder="Enter maximum price"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="endTime" className="block font-medium">End Time</label>
            <input
              type="datetime-local"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <button type="submit" className="w-full bg-blue-500 text-white rounded-md p-2 mt-4">
            Create Contract
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateContract;
