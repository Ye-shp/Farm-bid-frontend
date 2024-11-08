import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../Styles/CheckoutForm.css';
import api from '../Services/api';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      return; // Stripe.js hasn't loaded yet.
    }

    const cardElement = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error(error);
      setErrorMessage(error.message);
      setIsProcessing(false);
      return;
    }

    // Send the payment method to your backend to create a payment intent
    try {
      const response = await api.createPaymentIntent({ amount: 5000 }); // Example amount
      const clientSecret = response.data.clientSecret;
      setClientSecret(clientSecret);
    } catch (error) {
      console.error("Failed to create payment intent:", error);
      setIsProcessing(false);
      return;
    }

    // Confirm the card payment using the client secret from the backend
    const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: paymentMethod.billing_details?.name || 'Customer', // Ensure name is collected from user
          },
        },
      }
    );

    if (confirmError) {
      console.error(confirmError);
      setErrorMessage(confirmError.message);
      setIsProcessing(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      setPaymentSuccess(true);
      setErrorMessage(null);
      console.log("Payment succeeded!");
      // Optionally update auction status or redirect user
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <h2 className="form-title">Complete Your Payment</h2>
      <CardElement className="card-element" />
      <button type="submit" disabled={isProcessing || !stripe} className="submit-button">
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>

      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {paymentSuccess && <div className="success-message">Payment successful!</div>}
    </form>
  );
};

export default CheckoutForm;
