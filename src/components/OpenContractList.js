import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const OpenContractList = () => {
  const [openContracts, setOpenContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = 'https://farm-bid-3998c30f5108.herokuapp.com';

  useEffect(() => {
    const fetchOpenContracts = async () => {
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

        // For buyers: get all their contracts
        // For farmers: get only open contracts they can fulfill
        const endpoint = userRole === 'buyer' ? '/api/contracts/my-contracts' : '/api/contracts/open';
        const response = await axios.get(`${API_URL}${endpoint}`, config);
        
        // Sort contracts by creation date (newest first)
        const sortedContracts = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setOpenContracts(sortedContracts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching open contracts:', error);
        setError(error.response?.data?.error || 'Failed to load contracts. Please try again later.');
        setLoading(false);
      }
    };

    fetchOpenContracts();
  }, [navigate, userRole]);

  const handleViewContract = (contractId) => {
    navigate(`/contracts/${contractId}`);
  };

  const handleCreateContract = () => {
    navigate('/contracts/create');
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {userRole === 'buyer' ? 'Your Contracts' : 'Available Contracts'}
          </h2>
          {userRole === 'buyer' && (
            <button
              onClick={handleCreateContract}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Create Contract
            </button>
          )}
        </div>
        
        {openContracts.length === 0 ? (
          <p className="text-center text-gray-600">
            {userRole === 'buyer' 
              ? 'You haven\'t created any contracts yet.'
              : 'No open contracts available at this time.'}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {openContracts.map((contract) => (
              <div
                key={contract._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewContract(contract._id)}
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{contract.productType}</h3>
                  <p className="text-gray-600">{contract.productCategory}</p>
                </div>
                
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Quantity:</span> {contract.quantity}
                  </p>
                  <p>
                    <span className="font-medium">Max Price:</span> ${contract.maxPrice}
                  </p>
                  <p>
                    <span className="font-medium">End Time:</span>{' '}
                    {new Date(contract.endTime).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    <span className="capitalize">{contract.status}</span>
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    {userRole === 'buyer' 
                      ? `Status: ${contract.status}`
                      : `Posted by: ${contract.buyer.username}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenContractList;
