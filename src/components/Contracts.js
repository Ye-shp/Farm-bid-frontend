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

      // For buyers: get all their contracts
      // For farmers: get only open contracts they can fulfill
      const endpoint = userRole === 'buyer' ? '/api/open-contracts/my-contracts' : '/api/open-contracts/open';
      const response = await axios.get(
        `${API_URL}${endpoint}`,
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
      const userId = localStorage.getItem('userId');
      switch (tabValue) {
        case 0: // Active Contracts
          return contracts.filter(contract => 
            contract.status === 'fulfilled' && 
            contract.fulfillments.some(f => f.farmer._id === userId && f.status === 'accepted')
          );
        case 1: // Available Contracts
          return contracts.filter(contract => 
            contract.status === 'open' &&
            !contract.fulfillments?.some(f => f.farmer._id === userId)
          );
        case 2: // My Offers
          return contracts.filter(contract =>
            contract.fulfillments?.some(f => 
              f.farmer._id === userId && 
              f.status === 'pending'
            )
          );
        case 3: // Completed
          return contracts.filter(contract =>
            contract.status === 'completed' &&
            contract.fulfillments.some(f => f.farmer._id === userId && f.status === 'accepted')
          );
        default:
          return [];
      }
    }
  };

  const renderContractCard = (contract) => {
    const userId = localStorage.getItem('userId');
    const acceptedFulfillment = contract.fulfillments?.find(f => 
      f.farmer._id === userId && f.status === 'accepted'
    );
    const myFulfillment = contract.fulfillments?.find(f => f.farmer._id === userId);

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
            {acceptedFulfillment && (
              <Typography variant="body2" color="primary" gutterBottom>
                Your offer was accepted!
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => navigate(`/contracts/${contract._id}`)}
              sx={{ 
                mt: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: 2,
                background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
                '&:hover': {
                  background: 'linear-gradient(to right, #1d4ed8, #1e40af)',
                  transform: 'scale(1.02)',
                  transition: 'all 0.2s',
                },
              }}
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
    <Box sx={{ p: 0 }}>
      <Box 
        sx={{ 
          p: 4,
          background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
          borderBottom: '1px solid #e2e8f0',
          mb: 4
        }}
      >
        <Box sx={{ 
          maxWidth: 1200,
          mx: 'auto',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
        }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 1,
                fontWeight: 700,
                background: 'linear-gradient(to right, #1e40af, #3b82f6)',
                backgroundClip: 'text',
                color: 'transparent',
                WebkitBackgroundClip: 'text'
              }}
            >
              Contracts Dashboard
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '1.1rem',
                maxWidth: '600px',
                lineHeight: 1.5
              }}
            >
              Manage your agricultural contracts, track agreements, and create new opportunities for trade
            </Typography>
          </Box>
          {userRole === 'buyer' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/create-contract')}
                startIcon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4V20M20 12L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #1d4ed8, #1e40af)',
                    transform: 'scale(1.02)',
                    transition: 'all 0.2s',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  },
                }}
              >
                Create Contract
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ px: 3 }}>
        <Box sx={{ 
          borderBottom: '1px solid #e2e8f0',
          mb: 4,
          background: 'white',
          borderRadius: '12px 12px 0 0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#2563eb',
                height: 3,
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                minHeight: '56px',
                color: '#64748b',
                '&:hover': {
                  color: '#2563eb',
                  backgroundColor: '#f8fafc',
                },
                '&.Mui-selected': {
                  color: '#2563eb',
                  fontWeight: 600,
                },
              },
            }}
          >
            {userRole === 'buyer' ? [
              <Tab 
                key="open" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.5 12C3.5 7.52166 7.13401 3.875 11.5 3.875C15.866 3.875 19.5 7.52166 19.5 12C19.5 16.4783 15.866 20.125 11.5 20.125C7.13401 20.125 3.5 16.4783 3.5 12Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M11.5 7.5V12L14.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Open
                  </Box>
                }
              />,
              <Tab 
                key="in-progress" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4.75L3.75 9L12 13.25L20.25 9L12 4.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.75 14L12 18.25L20.25 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    In Progress
                  </Box>
                }
              />,
              <Tab 
                key="completed" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Completed
                  </Box>
                }
              />
            ] : [
              <Tab 
                key="active" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4.75L3.75 9L12 13.25L20.25 9L12 4.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.75 14L12 18.25L20.25 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Active Contracts
                  </Box>
                }
              />,
              <Tab 
                key="available" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Available Contracts
                  </Box>
                }
              />,
              <Tab 
                key="offers" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 12V22H4V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 7H2V12H22V7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 22V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    My Offers
                  </Box>
                }
              />,
              <Tab 
                key="completed" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Completed
                  </Box>
                }
              />
            ]}
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
    </Box>
  );
};

export default Contracts;
