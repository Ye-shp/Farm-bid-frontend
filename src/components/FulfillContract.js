// src/components/FulfillContract.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const FulfillContract = () => {
  const { contractId } = useParams(); // Retrieve the contract ID from the URL
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmationDetails, setConfirmationDetails] = useState('');
  const navigate = useNavigate();
  const API_URL = 'https://farm-bid-3998c30f5108.herokuapp.com';

  useEffect(() => {
    // Fetch contract details
    const fetchContractDetails = async () => {
      try {
        const token = localStorage.getItem('token');
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
  }, [contractId]);

  const handleFulfill = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`${API_URL}/api/open-contracts/${contractId}/fulfill`, { confirmationDetails }, config);
      if (response.status === 200) {
        alert('Contract fulfilled successfully!');
        navigate('/OpenContractList'); // Redirect to the open contracts list
      }
    } catch (error) {
      console.error('Error fulfilling contract:', error);
      alert('Failed to fulfill contract. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Fulfill Contract</h2>
        {contract ? (
          <div className="space-y-4">
            <p><strong>Product Type:</strong> {contract.productType}</p>
            <p><strong>Quantity:</strong> {contract.quantity}</p>
            <p><strong>Max Price:</strong> ${contract.maxPrice}</p>
            <p><strong>End Time:</strong> {new Date(contract.endTime).toLocaleString()}</p>
            <div className="space-y-2">
              <label htmlFor="confirmationDetails" className="block font-medium">Confirmation Details</label>
              <textarea
                id="confirmationDetails"
                value={confirmationDetails}
                onChange={(e) => setConfirmationDetails(e.target.value)}
                className="w-full border rounded-md p-2"
                placeholder="Enter confirmation details for fulfilling the contract"
                required
              />
            </div>
            <button
              onClick={handleFulfill}
              className="mt-4 bg-blue-500 text-white rounded-md p-2"
            >
              Fulfill Contract
            </button>
          </div>
        ) : (
          <p>Contract details not available.</p>
        )}
      </div>
    </div>
  );
};

export default FulfillContract;
