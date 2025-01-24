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
  MenuItem
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './payment/PaymentForm';
import TransactionStatus from './payment/TransactionStatus';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const ContractDetails = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole] = useState(localStorage.getItem('role'));
  const [userId] = useState(localStorage.getItem('userId'));
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [selectedFulfillment, setSelectedFulfillment] = useState(null);
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

      const response = await axios.get(`${API_URL}/api/open-contracts/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Contract details:', {
        contract: response.data,
        userRole,
        userId,
        isBuyer: response.data.buyer._id === userId
      });
      
      setContract(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contract:', error);
      setError(error.response?.data?.error || 'Failed to load contract details');
      setLoading(false);
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
      setShowCheckoutDialog(false);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to accept fulfillment');
    }
  };

  const initiateCheckout = (fulfillment) => {
    setSelectedFulfillment(fulfillment);
    setShowCheckoutDialog(true);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!contract) return <Alert severity="info">No contract found</Alert>;

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
                  {`${contract.deliveryAddress.street}, ${contract.deliveryAddress.city}, ${contract.deliveryAddress.state} ${contract.deliveryAddress.zipCode}`}
                </Typography>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Fulfillments
          </Typography>

          {contract.fulfillments && contract.fulfillments.length > 0 ? (
            contract.fulfillments.map((fulfillment) => {
              const isAcceptable = 
                userRole === 'buyer' && 
                contract.buyer._id === userId && 
                contract.status === 'open' && 
                fulfillment.status === 'pending' &&
                contract.paymentStatus === 'pending';

              const totalAmount = (fulfillment.price * contract.quantity) + (fulfillment.deliveryFee || 0);

              return (
                <Card key={fulfillment._id} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Farmer
                        </Typography>
                        <Typography variant="body1">
                          {fulfillment.farmer.username}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Price Per Unit
                        </Typography>
                        <Typography variant="body1">
                          ${fulfillment.price}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Total: ${totalAmount.toFixed(2)}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Delivery Method
                        </Typography>
                        <Typography variant="body1">
                          {fulfillment.deliveryMethod.replace(/_/g, ' ').toUpperCase()}
                        </Typography>
                        {fulfillment.deliveryFee > 0 && (
                          <Typography variant="body2" color="textSecondary">
                            Delivery Fee: ${fulfillment.deliveryFee}
                          </Typography>
                        )}
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

                      {fulfillment.estimatedDeliveryDate && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Estimated Delivery
                          </Typography>
                          <Typography variant="body1">
                            {new Date(fulfillment.estimatedDeliveryDate).toLocaleDateString()}
                          </Typography>
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Status
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: fulfillment.status === 'accepted' ? 'success.main' : 
                                fulfillment.status === 'rejected' ? 'error.main' : 'text.primary'
                        }}>
                          {fulfillment.status.toUpperCase()}
                        </Typography>
                      </Grid>

                      {isAcceptable && (
                        <Grid item xs={12}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => initiateCheckout(fulfillment)}
                            sx={{ mt: 2 }}
                          >
                            Accept & Pay (${totalAmount.toFixed(2)})
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Typography color="textSecondary">
              No fulfillments yet
            </Typography>
          )}
        </CardContent>
      </Card>

      <Dialog 
        open={showCheckoutDialog} 
        onClose={() => setShowCheckoutDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Complete Purchase</DialogTitle>
        <DialogContent>
          {selectedFulfillment && (
            <PaymentForm
              amount={(selectedFulfillment.price * contract.quantity + (selectedFulfillment.deliveryFee || 0))}
              sourceType="contract"
              sourceId={contractId}
              sellerId={contract.seller._id}
              onSuccess={() => handleAcceptFulfillment(selectedFulfillment._id)}
              onError={(error) => console.error('Payment error:', error)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ContractDetails;
