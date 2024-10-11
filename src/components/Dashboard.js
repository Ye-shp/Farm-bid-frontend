// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FarmerDashboard from './FarmerDashboard';
import BuyerDashboard from './BuyerDashboard';
import '../Styles/Dashboard.css';

const Dashboard = () => {
  const [role, setRole] = useState('');

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get('/api/user-role'); // Assume an endpoint that returns the user's role
        setRole(response.data.role);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <div className="dashboard">
      {role === 'farmer' ? <FarmerDashboard /> : <BuyerDashboard />}
    </div>
  );
};

export default Dashboard;
