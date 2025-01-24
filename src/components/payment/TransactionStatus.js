import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  styled
} from '@mui/material';
import PaymentService from '../../Services/paymentService';
import { AttachMoney, AccountBalance } from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2]
}));

const TRANSACTION_STEPS = {
  pending: 0,
  processing: 1,
  payment_held: 2,
  completed: 3
};

const TransactionStatus = ({ transactionId, onComplete }) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [bankAccountDetails, setBankAccountDetails] = useState({
    accountNumber: '',
    routingNumber: '',
    holderName: ''
  });

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const data = await PaymentService.getTransaction(transactionId);
        setTransaction(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
    
    // Poll for updates every 5 seconds if not completed
    const interval = setInterval(() => {
      if (transaction?.status !== 'completed') {
        fetchTransaction();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [transactionId]);

  const handleAddBankAccount = async () => {
    try {
      await PaymentService.addBankAccount({
        accountNumber: bankAccountDetails.accountNumber,
        routingNumber: bankAccountDetails.routingNumber,
        holderName: bankAccountDetails.holderName
      });
      setPayoutDialogOpen(false);
      // Refresh transaction to show updated bank account status
      const data = await PaymentService.getTransaction(transactionId);
      setTransaction(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProcessPayout = async () => {
    try {
      await PaymentService.processPayout(transactionId);
      const data = await PaymentService.getTransaction(transactionId);
      setTransaction(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  const currentStep = TRANSACTION_STEPS[transaction?.status] || 0;

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Transaction Status
        </Typography>
        
        <Stepper activeStep={currentStep} sx={{ mb: 3 }}>
          <Step>
            <StepLabel>Payment Initiated</StepLabel>
          </Step>
          <Step>
            <StepLabel>Processing</StepLabel>
          </Step>
          <Step>
            <StepLabel>Payment Held</StepLabel>
          </Step>
          <Step>
            <StepLabel>Completed</StepLabel>
          </Step>
        </Stepper>

        <Divider sx={{ my: 2 }} />

        <List>
          <ListItem>
            <ListItemText 
              primary="Status" 
              secondary={transaction?.status.replace('_', ' ').toUpperCase()} 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Amount" 
              secondary={`$${transaction?.amount.toFixed(2)}`} 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Platform Fee" 
              secondary={`$${transaction?.fees.platform.toFixed(2)}`} 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Processing Fee" 
              secondary={`$${transaction?.fees.processing.toFixed(2)}`} 
            />
          </ListItem>
          {transaction?.payout && (
            <>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Payout Amount" 
                  secondary={`$${transaction.payout.amount.toFixed(2)}`} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Payout Status" 
                  secondary={transaction.payout.status.toUpperCase()} 
                />
              </ListItem>
            </>
          )}
        </List>

        {transaction?.status === 'payment_held' && !transaction?.payout && (
          <Box mt={2} display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<AccountBalance />}
              onClick={() => setPayoutDialogOpen(true)}
            >
              Add Bank Account
            </Button>
            {transaction?.bankAccountVerified && (
              <Button
                variant="contained"
                color="success"
                fullWidth
                startIcon={<AttachMoney />}
                onClick={handleProcessPayout}
              >
                Process Payout
              </Button>
            )}
          </Box>
        )}

        {transaction?.status === 'completed' && onComplete && (
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => onComplete(transaction)}
            >
              Continue
            </Button>
          </Box>
        )}

        <Dialog open={payoutDialogOpen} onClose={() => setPayoutDialogOpen(false)}>
          <DialogTitle>Add Bank Account</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Account Number"
                value={bankAccountDetails.accountNumber}
                onChange={(e) => setBankAccountDetails(prev => ({
                  ...prev,
                  accountNumber: e.target.value
                }))}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Routing Number"
                value={bankAccountDetails.routingNumber}
                onChange={(e) => setBankAccountDetails(prev => ({
                  ...prev,
                  routingNumber: e.target.value
                }))}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Account Holder Name"
                value={bankAccountDetails.holderName}
                onChange={(e) => setBankAccountDetails(prev => ({
                  ...prev,
                  holderName: e.target.value
                }))}
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPayoutDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddBankAccount} variant="contained">
              Add Bank Account
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </StyledCard>
  );
};

export default TransactionStatus;
