import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button
} from '@mui/material';
import PaymentForm from '../payment/PaymentForm';
import TransactionStatus from '../payment/TransactionStatus';

const STEPS = ['Review', 'Payment', 'Confirmation']; 

const AuctionPayment = ({ auction, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [transactionId, setTransactionId] = useState(null);

  const handlePaymentSuccess = (paymentIntent) => {
    setTransactionId(paymentIntent.metadata.transactionId);
    setActiveStep(2);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Purchase
            </Typography>
            <Typography>
              Item: {auction.product.title}
            </Typography>
            <Typography>
              Winning Bid: ${auction.winningBid.amount.toFixed(2)}
            </Typography>
            <Box mt={2}>
              <Button
                variant="contained"
                onClick={() => setActiveStep(1)}
              >
                Proceed to Payment
              </Button>
            </Box>
          </Box>
        );

      case 1:
        return (
          <PaymentForm
            amount={auction.winningBid.amount}
            sourceType="auction"
            sourceId={auction._id}
            sellerId={auction.product.user}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        );

      case 2:
        return (
          <TransactionStatus
            transactionId={transactionId}
            onComplete={onComplete}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box mb={4}>
        <Stepper activeStep={activeStep}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      {renderStepContent()}
    </Container>
  );
};

export default AuctionPayment;
