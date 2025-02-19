import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  TextField
} from '@mui/material';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CARD_ELEMENT_OPTIONS = {
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

const PaymentMethodForm = ({ clientSecret, onSubmit, isProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements || !name) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const { error: submitError, paymentMethod: stripePaymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name,
        },
      });

      if (submitError) {
        throw submitError;
      }

      const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: stripePaymentMethod.id
      });

      if (confirmError) {
        throw confirmError;
      }

      onSubmit();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
        <FormLabel component="legend">Select Payment Method</FormLabel>
        <RadioGroup
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
        </RadioGroup>
      </FormControl>

      {paymentMethod === 'card' && (
        <>
          <TextField
            fullWidth
            label="Cardholder Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </Box>
        </>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={isProcessing || !stripe}
        sx={{ py: 1.5 }}
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </Button>
    </Box>
  );
};

export default PaymentMethodForm;
