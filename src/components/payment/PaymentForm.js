import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import PaymentService from '../../Services/paymentService';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  styled
} from '@mui/material';
import PaymentMethodForm from './PaymentMethodForm';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 480,
  margin: '0 auto',
  width: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: 'none',
}));

const PaymentFormContent = ({ amount, sourceType, sourceId, sellerId, bidId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [displayAmounts, setDisplayAmounts] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const amounts = PaymentService.calculateDisplayAmounts(amount);
        setDisplayAmounts(amounts);

        const { client_secret: secret } = await PaymentService.createPaymentIntent({
          amount: amounts.total,
          sourceType,
          sourceId,
          buyerId: user.id,
          sellerId,
          metadata: {
            sourceType,
            sourceId,
            bidId,
          }
        });
        setClientSecret(secret);
      } catch (error) {
        console.error('Payment initialization error:', error);
        setErrorMessage(error.message || 'Failed to initialize payment');
        onError?.(error);
      }
    };

    if (amount && sourceId && sellerId) {
      initializePayment();
    }
  }, [amount, sourceType, sourceId, sellerId, user, bidId]);

  const handlePaymentMethodSubmit = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Payment is handled directly in PaymentMethodForm
      setShowPaymentMethod(false);
      onSuccess?.();
    } catch (error) {
      console.error('Payment method error:', error);
      setErrorMessage(error.message);
      onError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    if (!stripe || !elements || !clientSecret) {
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/payment/confirm`,
          payment_method_data: {
            billing_details: {
              email: user?.email
            },
            metadata: {
              sourceType,
              sourceId,
              bidId,
              userId: user?.id,
              deliveryMethod: 'pickup'
            }
          }
        }
      });

      if (error) {
        throw error;
      }

      if (paymentIntent.status === 'requires_payment_method') {
        setShowPaymentMethod(true);
        setIsProcessing(false);
        return;
      } else if (paymentIntent.status === 'requires_action') {
        setErrorMessage('Additional authentication required. Please complete the verification.');
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess?.(paymentIntent);
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      setErrorMessage(error.message || 'An unexpected error occurred');
      onError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!clientSecret) { 
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <StyledCard>
      <CardContent>
        {displayAmounts && (
          <List sx={{ mb: 3 }}>
            <ListItem>
              <ListItemText primary="Subtotal" secondary={`$${displayAmounts.subtotal.toFixed(2)}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Platform Fee" secondary={`$${displayAmounts.platformFee.toFixed(2)}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Processing Fee" secondary={`$${displayAmounts.processingFee.toFixed(2)}`} />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary={<Typography variant="subtitle1" fontWeight="bold">Total</Typography>}
                secondary={<Typography variant="subtitle1" fontWeight="bold">${displayAmounts.total.toFixed(2)}</Typography>}
              />
            </ListItem>
          </List>
        )}

        {showPaymentMethod ? (
          <PaymentMethodForm
            clientSecret={clientSecret}
            onSubmit={handlePaymentMethodSubmit}
            isProcessing={isProcessing}
          />
        ) : (
          <form onSubmit={handleSubmit}>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}
            
            <Box sx={{ mb: 3 }}>
              <PaymentElement />
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={!stripe || isProcessing}
              sx={{
                py: 1.5,
                position: 'relative',
              }}
            >
              {isProcessing ? (
                <>
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      marginLeft: '-12px',
                    }}
                  />
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </StyledCard>
  );
};

const PaymentForm = ({ amount, sourceType, sourceId, bidId, onSuccess, onError }) => {
  const options = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#1976d2',
        borderRadius: '12px',
      },
    },
    paymentMethodOrder: ['card', 'klarna', 'link', 'cashapp', 'amazon_pay'],
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormContent {...{ amount, sourceType, sourceId, bidId, onSuccess, onError }} />
    </Elements>
  );
};

export default PaymentForm;
