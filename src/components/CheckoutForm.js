import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import '../Styles/CheckoutForm.css';
import api from '../Services/api';

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
        const response = await api.post(
          `/api/transactions/${sourceType}`,
          {
            [sourceType === 'auction' ? 'auctionId' : 'contractId']: sourceId,
          }
        );

        setClientSecret(response.data.clientSecret);
        setTransaction(response.data.transaction);
      } catch (error) {
        console.error('Failed to initialize payment:', error);
        setErrorMessage(error.response?.data?.message || 'Failed to initialize payment');
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

      if (paymentIntent.status === 'requires_capture' || paymentIntent.status === 'succeeded') {
        setPaymentSuccess(true);
        setTransaction((prev) => ({ ...prev, paymentIntent: { status: paymentIntent.status } }));
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-md border p-4">
            <CardElement className="w-full card-element" />
          </div>

          {amount && (
            <div className="text-lg font-semibold text-center">
              Total: ${(amount / 100).toFixed(2)}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full submit-button" 
            disabled={isProcessing || !stripe || !clientSecret}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </Button>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {paymentSuccess && (
            <Alert>
              <AlertDescription>
                Payment authorized successfully! The payment will be captured upon delivery confirmation.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default CheckoutForm;