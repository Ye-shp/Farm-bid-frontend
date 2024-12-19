import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const ContractDetails = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole] = useState(localStorage.getItem('role'));
  const [userId] = useState(localStorage.getItem('userId'));
  const [fulfillmentPrice, setFulfillmentPrice] = useState('');
  const [fulfillmentNotes, setFulfillmentNotes] = useState('');
  const [showFulfillDialog, setShowFulfillDialog] = useState(false);
  const API_URL = 'https://farm-bid-3998c30f5108.herokuapp.com';

  useEffect(() => {
    fetchContractDetails();
  }, [contractId]);

  const fetchContractDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('Fetching contract details:', {
        contractId,
        userRole,
        userId,
        token: token.substring(0, 20) + '...'
      });

      const response = await axios.get(`${API_URL}/api/open-contracts/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Contract details response:', {
        buyerId: response.data.buyer._id,
        status: response.data.status,
        fulfillments: response.data.fulfillments?.map(f => ({
          farmerId: f.farmer._id,
          status: f.status
        }))
      });

      setContract(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contract:', error);
      const errorDetails = error.response?.data?.details;
      if (error.response?.status === 403) {
        setError(`You do not have permission to view this contract. Details: ${JSON.stringify(errorDetails)}`);
      } else {
        setError(error.response?.data?.error || 'Failed to load contract details');
      }
      setLoading(false);
    }
  };

  const handleFulfillContract = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Submitting fulfillment:', {
        price: fulfillmentPrice,
        notes: fulfillmentNotes
      });

      await axios.post(
        `${API_URL}/api/open-contracts/${contractId}/fulfill`,
        {
          price: parseFloat(fulfillmentPrice),
          notes: fulfillmentNotes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowFulfillDialog(false);
      setError(null);
      fetchContractDetails();
    } catch (error) {
      console.error('Fulfillment error:', error.response?.data || error);
      setError(error.response?.data?.error || 'Failed to fulfill contract. Please try again.');
    }
  };

  const handleAcceptFulfillment = async (fulfillmentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/open-contracts/${contractId}/fulfillments/${fulfillmentId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchContractDetails();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to accept fulfillment');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!contract) return <Alert severity="info">No contract found</Alert>;

  const canFulfill = userRole === 'farmer' && 
    contract.status === 'open' && 
    !contract.fulfillments?.some(f => f.farmer === userId);

  const isBuyer = userRole === 'buyer' && contract.buyer === userId;

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Contract Details
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Product Type
              </Typography>
              <Typography variant="body1" gutterBottom>
                {contract.productType}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Quantity
              </Typography>
              <Typography variant="body1" gutterBottom>
                {contract.quantity} units
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Maximum Price
              </Typography>
              <Typography variant="body1" gutterBottom>
                ${contract.maxPrice}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Status
              </Typography>
              <Typography variant="body1" gutterBottom>
                {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
              </Typography>
            </Grid>

            {contract.deliveryMethod && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" color="textSecondary">
                  Delivery Method
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {contract.deliveryMethod.replace(/_/g, ' ').toUpperCase()}
                </Typography>
              </Grid>
            )}

            {contract.deliveryAddress && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="textSecondary">
                  Delivery Address
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {contract.deliveryAddress}
                </Typography>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Fulfillments
          </Typography>

          {contract.fulfillments && contract.fulfillments.length > 0 ? (
            contract.fulfillments.map((fulfillment) => (
              <Card key={fulfillment._id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Farmer
                      </Typography>
                      <Typography variant="body1">
                        {fulfillment.farmer.username}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Offered Price
                      </Typography>
                      <Typography variant="body1">
                        ${fulfillment.price}
                      </Typography>
                    </Grid>

                    {fulfillment.notes && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Notes
                        </Typography>
                        <Typography variant="body1">
                          {fulfillment.notes}
                        </Typography>
                      </Grid>
                    )}

                    {isBuyer && contract.status === 'open' && (
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleAcceptFulfillment(fulfillment._id)}
                        >
                          Accept Offer
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography color="textSecondary">
              No fulfillments yet
            </Typography>
          )}

          {canFulfill && (
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowFulfillDialog(true)}
              >
                Fulfill Contract
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={showFulfillDialog} onClose={() => setShowFulfillDialog(false)}>
        <DialogTitle>Fulfill Contract</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your Price"
            type="number"
            fullWidth
            value={fulfillmentPrice}
            onChange={(e) => setFulfillmentPrice(e.target.value)}
            InputProps={{
              inputProps: { min: 0, max: contract?.maxPrice }
            }}
          />
          <TextField
            margin="dense"
            label="Notes (Optional)"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={fulfillmentNotes}
            onChange={(e) => setFulfillmentNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFulfillDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleFulfillContract}
            disabled={!fulfillmentPrice || parseFloat(fulfillmentPrice) > contract?.maxPrice}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractDetails;
