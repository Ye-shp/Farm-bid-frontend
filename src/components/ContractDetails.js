import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
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
  const [showFulfillDialog, setShowFulfillDialog] = useState(false);
  const API_URL = 'https://farm-bid.onrender.com';

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

  const handleSubmitFulfillment = async (values) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/open-contracts/${contractId}/fulfill`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchContractDetails();
      setShowFulfillDialog(false);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit fulfillment');
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

  const fulfillmentSchema = Yup.object().shape({
    price: Yup.number()
      .required('Required')
      .positive('Must be positive')
      .max(contract.maxPrice, 'Price exceeds maximum allowed'),
    deliveryMethod: Yup.string().required('Required'),
    estimatedDeliveryDate: Yup.date()
      .required('Required')
      .min(new Date(), 'Delivery date must be in the future'),
    deliveryFee: Yup.number().min(0, 'Cannot be negative'),
    notes: Yup.string()
  });

  const isFarmer = userRole === 'farmer';
  const hasExistingFulfillment = contract.fulfillments?.some(
    f => f.farmer._id === userId
  );
  const canFulfill = isFarmer && contract.status === 'open' && !hasExistingFulfillment;
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
          {canFulfill && (
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="h6" gutterBottom>
                Submit Your Offer
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowFulfillDialog(true)}
                sx={{ mb: 3 }}
              >
                Submit Fulfillment Offer
              </Button>

              <Dialog open={showFulfillDialog} onClose={() => setShowFulfillDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Submit Fulfillment Offer</DialogTitle>
                <DialogContent>
                  <Formik
                    initialValues={{
                      price: '',
                      deliveryMethod: 'farmer_delivery',
                      deliveryFee: 0,
                      estimatedDeliveryDate: '',
                      notes: ''
                    }}
                    validationSchema={fulfillmentSchema}
                    onSubmit={handleSubmitFulfillment}
                  >
                    {({ errors, touched }) => (
                      <Form>
                        <Field name="price">
                          {({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              margin="normal"
                              label="Price per unit"
                              type="number"
                              inputProps={{ step: "0.01" }}
                              error={touched.price && !!errors.price}
                              helperText={touched.price && errors.price}
                            />
                          )}
                        </Field>

                        <Field name="deliveryMethod">
                          {({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              margin="normal"
                              label="Delivery Method"
                              select
                              error={touched.deliveryMethod && !!errors.deliveryMethod}
                              helperText={touched.deliveryMethod && errors.deliveryMethod}
                            >
                              <MenuItem value="buyer_pickup">Buyer Pickup</MenuItem>
                              <MenuItem value="farmer_delivery">Farmer Delivery</MenuItem>
                              <MenuItem value="third_party">Third Party</MenuItem>
                            </TextField>
                          )}
                        </Field>

                        <Field name="deliveryFee">
                          {({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              margin="normal"
                              label="Delivery Fee"
                              type="number"
                              inputProps={{ step: "0.01" }}
                              error={touched.deliveryFee && !!errors.deliveryFee}
                              helperText={touched.deliveryFee && errors.deliveryFee}
                            />
                          )}
                        </Field>

                        <Field name="estimatedDeliveryDate">
                          {({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              margin="normal"
                              label="Estimated Delivery Date"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              error={touched.estimatedDeliveryDate && !!errors.estimatedDeliveryDate}
                              helperText={touched.estimatedDeliveryDate && errors.estimatedDeliveryDate}
                            />
                          )}
                        </Field>

                        <Field name="notes">
                          {({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              margin="normal"
                              label="Additional Notes"
                              multiline
                              rows={3}
                            />
                          )}
                        </Field>

                        <DialogActions sx={{ mt: 2 }}>
                          <Button onClick={() => setShowFulfillDialog(false)}>Cancel</Button>
                          <Button type="submit" variant="contained" color="primary">
                            Submit Offer
                          </Button>
                        </DialogActions>
                      </Form>
                    )}
                  </Formik>
                </DialogContent>
              </Dialog>
            </Box>
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
              sellerId={selectedFulfillment.farmer._id}
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
