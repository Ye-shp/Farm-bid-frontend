import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  Alert,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Box,
  styled,
} from '@mui/material';

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 480,
  margin: '0 auto',
  width: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: 'none',
}));

const CheckoutForm = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message);
        setIsProcessing(false);
      } else {
        onSuccess();
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred.');
      setIsProcessing(false);
    }
  };

  return (
    <StyledCard>
      <CardContent>
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

export default CheckoutForm;
