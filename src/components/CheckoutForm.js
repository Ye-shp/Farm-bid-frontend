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

const CheckoutForm = ({ sourceType, sourceId, amount }) => {
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
        // Create transaction based on source type
        const response = await api.post(`/api/transactions/${sourceType}`, {
          [sourceType === 'auction' ? 'auctionId' : 'contractId']: sourceId,
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

    if (sourceId && sourceType) {
      initializePayment();
    }
  }, [sourceId, sourceType]);

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
      // Confirm the payment with manual capture enabled
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

      if (
        paymentIntent.status === 'requires_capture' ||
        paymentIntent.status === 'succeeded'
      ) {
        setPaymentSuccess(true);
        setTransaction((prev) => ({
          ...prev,
          paymentIntent: { status: paymentIntent.status },
        }));
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
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'grey.400',
              borderRadius: 1,
              p: 2,
            }}
          >
            <CardElement className="card-element" />
          </Box>

          {amount && (
            <Typography variant="h6" align="center">
              Total: ${(amount / 100).toFixed(2)}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isProcessing || !stripe || !clientSecret}
          >
            {isProcessing ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </Button>

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {paymentSuccess && (
            <Alert severity="success">
              Payment authorized successfully! The payment will be captured upon
              delivery confirmation.
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CheckoutForm;
