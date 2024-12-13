import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const Contracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [userRole] = useState(localStorage.getItem('role'));
  const navigate = useNavigate();
  const API_URL = 'https://farm-bid-3998c30f5108.herokuapp.com';

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/contracts/${userRole === 'buyer' ? 'my-contracts' : 'open'}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContracts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setError(error.response?.data?.error || 'Failed to load contracts');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getFilteredContracts = () => {
    if (userRole === 'buyer') {
      switch (tabValue) {
        case 0: // Open
          return contracts.filter(contract => contract.status === 'open');
        case 1: // In Progress
          return contracts.filter(contract => 
            ['pending_fulfillment', 'fulfilled'].includes(contract.status)
          );
        case 2: // Completed
          return contracts.filter(contract => contract.status === 'completed');
        default:
          return [];
      }
    } else { // Farmer
      switch (tabValue) {
        case 0: // Active Contracts
          return contracts.filter(contract => 
            contract.status === 'fulfilled' && 
            contract.winningFulfillment?.farmer === localStorage.getItem('userId')
          );
        case 1: // Available Contracts
          return contracts.filter(contract => 
            contract.status === 'open' &&
            !contract.fulfillments?.some(f => f.farmer === localStorage.getItem('userId'))
          );
        case 2: // My Offers
          return contracts.filter(contract =>
            contract.fulfillments?.some(f => 
              f.farmer === localStorage.getItem('userId') && 
              f.status === 'pending'
            )
          );
        case 3: // Completed
          return contracts.filter(contract =>
            contract.status === 'completed' &&
            contract.winningFulfillment?.farmer === localStorage.getItem('userId')
          );
        default:
          return [];
      }
    }
  };

  const renderContractCard = (contract) => {
    const isWinningFarmer = contract.winningFulfillment?.farmer === localStorage.getItem('userId');
    const myFulfillment = contract.fulfillments?.find(f => f.farmer === localStorage.getItem('userId'));

    return (
      <Grid item xs={12} sm={6} md={4} key={contract._id}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {contract.productType}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              Quantity: {contract.quantity} units
            </Typography>
            <Typography variant="body2" gutterBottom>
              Max Price: ${contract.maxPrice}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Status: {contract.status.replace(/_/g, ' ').toUpperCase()}
            </Typography>
            {myFulfillment && (
              <Typography variant="body2" gutterBottom>
                Your Offer: ${myFulfillment.price}
              </Typography>
            )}
            {isWinningFarmer && (
              <Typography variant="body2" color="primary" gutterBottom>
                You won this contract!
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => navigate(`/contracts/${contract._id}`)}
            >
              View Details
            </Button>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Contracts
        </Typography>
        {userRole === 'buyer' && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/create-contract')}
          >
            Create Contract
          </Button>
        )}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          {userRole === 'buyer' ? (
            <>
              <Tab label="Open" />
              <Tab label="In Progress" />
              <Tab label="Completed" />
            </>
          ) : (
            <>
              <Tab label="Active Contracts" />
              <Tab label="Available Contracts" />
              <Tab label="My Offers" />
              <Tab label="Completed" />
            </>
          )}
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {getFilteredContracts().length === 0 ? (
          <Grid item xs={12}>
            <Typography color="textSecondary">
              No contracts found in this category
            </Typography>
          </Grid>
        ) : (
          getFilteredContracts().map(renderContractCard)
        )}
      </Grid>
    </Box>
  );
};

export default Contracts;
