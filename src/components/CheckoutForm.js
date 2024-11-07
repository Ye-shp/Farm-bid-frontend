import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../Styles/CheckoutForm.css';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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
    const response = await fetch('/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 5000 }), // Example amount in cents, $50
    });

    const paymentIntent = await response.json();

    // Confirm the card payment using the client secret from the backend
    const { error: confirmError, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
      paymentIntent.clientSecret,
      {
        payment_method: paymentMethod.id,
      }
    );

    if (confirmError) {
      console.error(confirmError);
      setErrorMessage(confirmError.message);
      setIsProcessing(false);
      return;
    }

    if (confirmedPayment.status === 'succeeded') {
      setPaymentSuccess(true);
      setErrorMessage(null);
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
