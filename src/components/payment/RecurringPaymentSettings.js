import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// Card input styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

// Add Payment Method Form
const AddPaymentMethodForm = ({ onSuccess, onCancel }) => {
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(true);
  const stripe = useStripe();
  const elements = useElements();
  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setProcessing(true);

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      setProcessing(false);
      return;
    }

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (error) {
        setError(error.message);
        setProcessing(false);
        return;
      }

      // Save payment method to backend
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/payments/methods`,
        {
          paymentMethodId: paymentMethod.id,
          setAsDefault
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save payment method');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Enter your card details
        </Typography>
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <CardElement options={cardElementOptions} />
        </Box>
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={setAsDefault}
            onChange={(e) => setSetAsDefault(e.target.checked)}
            color="primary"
          />
        }
        label="Set as default payment method"
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={processing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!stripe || processing}
        >
          {processing ? <CircularProgress size={24} /> : 'Add Payment Method'}
        </Button>
      </Box>
    </form>
  );
};

// Main Component
const RecurringPaymentSettings = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [settings, setSettings] = useState({
    autoPayEnabled: false,
    defaultPaymentMethodId: '',
    notificationPreferences: {
      emailNotifications: true,
      smsNotifications: false,
      advanceNoticeDays: 3
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch payment methods
      const methodsResponse = await axios.get(
        `${API_URL}/api/payments/methods`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Fetch recurring payment settings
      const settingsResponse = await axios.get(
        `${API_URL}/api/payments/recurring-settings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPaymentMethods(methodsResponse.data);
      
      if (Object.keys(settingsResponse.data).length > 0) {
        setSettings(settingsResponse.data);
      }
      
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_URL}/api/payments/recurring-settings`,
        settings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Payment settings updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${API_URL}/api/payments/methods/${paymentMethodId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh data
      fetchData();
      setSuccess('Payment method removed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove payment method');
      setLoading(false);
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_URL}/api/payments/methods/${paymentMethodId}/default`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update settings
      setSettings({
        ...settings,
        defaultPaymentMethodId: paymentMethodId
      });
      
      // Refresh data
      fetchData();
      setSuccess('Default payment method updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update default payment method');
      setLoading(false);
    }
  };

  const handleAddPaymentMethodSuccess = () => {
    setShowAddPaymentMethod(false);
    fetchData();
    setSuccess('Payment method added successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Format card details for display
  const formatCardDetails = (card) => {
    return `${card.brand.toUpperCase()} •••• ${card.last4} (Expires ${card.exp_month}/${card.exp_year})`;
  };

  if (loading && paymentMethods.length === 0) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Recurring Payment Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment Methods
          </Typography>
          
          {paymentMethods.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              You don't have any payment methods saved. Add one to enable automatic payments.
            </Alert>
          ) : (
            <Box sx={{ mb: 3 }}>
              {paymentMethods.map((method) => (
                <Box 
                  key={method.id} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 2,
                    mb: 1,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    backgroundColor: method.id === settings.defaultPaymentMethodId ? '#f0f7ff' : 'white'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {method.id === settings.defaultPaymentMethodId && (
                      <CheckCircleIcon color="primary" sx={{ mr: 1 }} />
                    )}
                    <Typography>
                      {method.card ? formatCardDetails(method.card) : method.id}
                    </Typography>
                  </Box>
                  <Box>
                    {method.id !== settings.defaultPaymentMethodId && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleSetDefaultPaymentMethod(method.id)}
                        sx={{ mr: 1 }}
                      >
                        Set as Default
                      </Button>
                    )}
                    <Tooltip title="Remove payment method">
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemovePaymentMethod(method.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          <Button
            variant="outlined"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setShowAddPaymentMethod(true)}
          >
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Automatic Payment Settings
          </Typography>

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoPayEnabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    autoPayEnabled: e.target.checked
                  })}
                  color="primary"
                  disabled={paymentMethods.length === 0}
                />
              }
              label="Enable automatic payments for recurring contracts"
            />
            
            {paymentMethods.length === 0 && settings.autoPayEnabled && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                You need to add a payment method to enable automatic payments.
              </Alert>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Notification Preferences
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notificationPreferences?.emailNotifications}
                    onChange={(e) => setSettings({
                      ...settings,
                      notificationPreferences: {
                        ...settings.notificationPreferences,
                        emailNotifications: e.target.checked
                      }
                    })}
                    color="primary"
                  />
                }
                label="Email notifications"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notificationPreferences?.smsNotifications}
                    onChange={(e) => setSettings({
                      ...settings,
                      notificationPreferences: {
                        ...settings.notificationPreferences,
                        smsNotifications: e.target.checked
                      }
                    })}
                    color="primary"
                  />
                }
                label="SMS notifications"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Advance Notice Days</InputLabel>
                <Select
                  value={settings.notificationPreferences?.advanceNoticeDays || 3}
                  onChange={(e) => setSettings({
                    ...settings,
                    notificationPreferences: {
                      ...settings.notificationPreferences,
                      advanceNoticeDays: e.target.value
                    }
                  })}
                  label="Advance Notice Days"
                >
                  <MenuItem value={1}>1 day</MenuItem>
                  <MenuItem value={2}>2 days</MenuItem>
                  <MenuItem value={3}>3 days</MenuItem>
                  <MenuItem value={5}>5 days</MenuItem>
                  <MenuItem value={7}>7 days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveSettings}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Settings'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Add Payment Method Dialog */}
      <Dialog
        open={showAddPaymentMethod}
        onClose={() => setShowAddPaymentMethod(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogContent>
          <Elements stripe={stripePromise}>
            <AddPaymentMethodForm
              onSuccess={handleAddPaymentMethodSuccess}
              onCancel={() => setShowAddPaymentMethod(false)}
            />
          </Elements>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default RecurringPaymentSettings; 