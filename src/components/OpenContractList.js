import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const OpenContractsList = () => {
  const [openContracts, setOpenContracts] = useState([]);
  const navigate = useNavigate();
  const API_URL = 'https://farm-bid-3998c30f5108.herokuapp.com';

  useEffect(() => {
    const fetchOpenContracts = async () => {
      try {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');
        if (userRole !== 'farmer') {
          alert('Only farmers can access this page.');
          navigate('/');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get(`${API_URL}/api/open-contracts`, config);
        setOpenContracts(response.data);
      } catch (error) {
        console.error('Error fetching open contracts:', error);
        alert('Failed to fetch open contracts. Please try again.');
      }
    };

    fetchOpenContracts();
  }, [navigate]);

  const handleFulfillContract = (contractId) => {
    navigate(`/fulfill-contract/${contractId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Available Open Contracts</h2>
        {openContracts.length === 0 ? (
          <p className="text-center">No open contracts available at the moment.</p>
        ) : (
          <div className="space-y-4">
            {openContracts.map((contract) => (
              <div key={contract._id} className="border p-4 rounded-md shadow-sm">
                <p><strong>Product Type:</strong> {contract.productType}</p>
                <p><strong>Quantity:</strong> {contract.quantity}</p>
                <p><strong>Max Price:</strong> ${contract.maxPrice}</p>
                <p><strong>End Time:</strong> {new Date(contract.endTime).toLocaleString()}</p>
                <button
                  onClick={() => handleFulfillContract(contract._id)}
                  className="mt-4 bg-blue-500 text-white rounded-md p-2"
                >
                  Fulfill Contract
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenContractsList;
