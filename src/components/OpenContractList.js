import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Container,
  Grid,
  Typography,
  Alert,
  Avatar,
  Stack,
} from '@mui/material';
import { styled } from '@mui/system';
import ContractIcon from '@mui/icons-material/Assignment';

const StyledCard = styled(Card)({
  backgroundColor: '#fff',
  borderRadius: '16px',
  boxShadow: '0px 3px 6px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
});

const OpenContractsList = () => {
  const [openContracts, setOpenContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        setError('Failed to fetch open contracts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOpenContracts();
  }, [navigate]);

  const handleFulfillContract = (contractId) => {
    navigate(`/fulfill-contract/${contractId}`);
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h3" align="center" gutterBottom>
          Available Open Contracts
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : openContracts.length === 0 ? (
          <Typography align="center" variant="h6">
            No open contracts available at the moment.
          </Typography>
        ) : (
          <Grid container spacing={4}>
            {openContracts.map((contract) => (
              <Grid item xs={12} sm={6} md={4} key={contract._id}>
                <StyledCard>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar>
                        <ContractIcon />
                      </Avatar>
                      <Typography variant="h6">{contract.productType}</Typography>
                    </Stack>
                    <Typography variant="body1" mt={2}><strong>Quantity:</strong> {contract.quantity}</Typography>
                    <Typography variant="body1"><strong>Max Price:</strong> ${contract.maxPrice}</Typography>
                    <Typography variant="body1"><strong>End Time:</strong> {new Date(contract.endTime).toLocaleString()}</Typography>
                  </CardContent>
                  <CardActions>
                    <Box mx={2} mb={2} width="100%">
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={() => handleFulfillContract(contract._id)}
                      >
                        Fulfill Contract
                      </Button>
                    </Box>
                  </CardActions>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default OpenContractsList;
