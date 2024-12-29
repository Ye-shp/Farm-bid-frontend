import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  Alert,
  Button,
  CircularProgress,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import api from '../Services/api';
import '../Styles/CheckoutForm.css';

const CheckoutForm = ({ sourceType, sourceId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Create payment intent
        const response = await api.createPaymentIntent({
          [sourceType === 'auction' ? 'auctionId' : 'contractId']: sourceId,
          amount: Math.round(amount * 100) // Convert to cents
        });

        setClientSecret(response.data.clientSecret);
        setTransaction(response.data.transaction);
      } catch (error) {
        console.error('Failed to initialize payment:', error);
        setErrorMessage(
          error.response?.data?.message || 'Failed to initialize payment'
        );
      }
    };

    if (sourceId && sourceType && amount) {
      initializePayment();
    }
  }, [sourceId, sourceType, amount]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    if (!stripe || !elements || !clientSecret) {
      setIsProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Customer', // Could be passed as prop
            },
          },
        }
      );

      if (error) {
        throw error;
      }

      if (paymentIntent.status === 'succeeded') {
        setPaymentSuccess(true);
        setTransaction((prev) => ({
          ...prev,
          paymentIntent: { status: paymentIntent.status },
        }));
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <CardHeader title="Complete Your Payment" />
      <CardContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Amount: ${amount.toFixed(2)}
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {paymentSuccess ? (
            <Alert severity="success">Payment successful!</Alert>
          ) : (
            <>
              <CardElement
                options={{
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
                }}
              />
              <Button
                variant="contained"
                disabled={!stripe || isProcessing}
                type="submit"
                sx={{ mt: 2 }}
              >
                {isProcessing ? (
                  <CircularProgress size={24} />
                ) : (
                  `Pay ${amount.toFixed(2)}`
                )}
              </Button>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CheckoutForm;
