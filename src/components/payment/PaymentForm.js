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

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const amounts = PaymentService.calculateDisplayAmounts(amount);
        setDisplayAmounts(amounts);

        const { clientSecret: secret } = await PaymentService.createPaymentIntent({
          amount: amounts.total,
          sourceType,
          sourceId,
          buyerId: user.id,
          sellerId,
          metadata: {
            sourceType,
            sourceId,
            bidId
          }
        });
        setClientSecret(secret);
      } catch (error) {
        setErrorMessage(error.message);
        onError?.(error);
      }
    };

    if (amount && sourceId && sellerId) {
      initializePayment();
    }
  }, [amount, sourceType, sourceId, sellerId, user, bidId]);

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
          return_url: window.location.origin + '/payment/confirm',
          payment_method_data: {
            metadata: {
              sourceType,
              sourceId,
              bidId,
              userId: user?.id
            }
          }
        }
      });

      if (error) {
        setErrorMessage(error.message);
        onError?.(error);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess?.(paymentIntent);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred.');
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
      </CardContent>
    </StyledCard>
  );
};

const PaymentForm = ({ 
  clientSecret, 
  amount, 
  sourceType, 
  sourceId, 
  bidId, 
  onSuccess, 
  onError 
}) => {
  const options = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#1976d2',
        borderRadius: '12px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormContent {...{ clientSecret, amount, sourceType, sourceId, bidId, onSuccess, onError }} />
    </Elements>
  );
};

export default PaymentForm;
