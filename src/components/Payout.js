import React, { useEffect, useState } from 'react';
import '../Styles/Payout.css';
import api from '../../src/Services/api';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Paper,
  useTheme,
  Grid,
  List,
  ListItem,
  ListItemText,
  InputAdornment
} from '@mui/material';
import { AttachMoney, AccountBalance, Email, AccountCircle } from '@mui/icons-material';

const Payouts = () => {
  const [balance, setBalance] = useState(0);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [accountCreated, setAccountCreated] = useState(false);
  const [bankAccountAdded, setBankAccountAdded] = useState(false);
  const [message, setMessage] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [transfers, setTransfers] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    const fetchPayoutData = async () => {
      try {
        const [balanceRes, transfersRes] = await Promise.all([
          api.get('/api/seller/balance'),
          api.get('/api/seller/transfers')
        ]);

        setBalance(balanceRes.data.balance);
        setPayoutHistory(balanceRes.data.payoutHistory);
        setTransfers(transfersRes.data.completed);
        setPendingTransfers(transfersRes.data.pending);
      } catch (error) {
        console.error('Error fetching payout data:', error);
        setMessage('Failed to fetch payout information');
      }
    };

    fetchPayoutData();
  }, []);

  const handlePayoutRequest = () => {
    if (!bankAccountAdded) {
      setMessage('Please add a bank account before requesting a payout.');
      return;
    }

    api.requestPayout({ amount: parseInt(amount, 10) * 100 })
      .then((response) => {
        if (response.data.success) {
          setMessage('Payout requested successfully!');
          setAmount('');
        } else {
          setMessage('Error processing payout.');
        }
      })
      .catch((error) => {
        console.error('Error requesting payout:', error);
        setMessage('Error processing payout.');
      });
  };

  const handleCreateAccount = () => {
    api.createConnectedAccount({ email })
      .then((response) => {
        if (response.data.accountId) {
          setAccountCreated(true);
          setMessage('Connected account created successfully!');
        } else {
          setMessage('Error creating connected account.');
        }
      })
      .catch((error) => {
        console.error('Error creating connected account:', error);
        setMessage('Error creating connected account.');
      });
  };

  const handleAddBankAccount = () => {
    api.addBankAccount({
      accountId: '<CONNECTED_ACCOUNT_ID>',
      bankAccountDetails: {
        accountNumber,
        routingNumber,
        holderName,
      },
    })
      .then((response) => {
        setMessage('Bank account added successfully!');
        setBankAccountAdded(true);
      })
      .catch((error) => {
        console.error('Error adding bank account:', error);
        setMessage('Error adding bank account.');
      });
  };

  const renderTransactionHistory = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Transaction History
      </Typography>
      <List>
        {transfers.map((transfer) => (
          <ListItem key={transfer.id}>
            <ListItemText
              primary={`$${(transfer.amount / 100).toFixed(2)} - ${transfer.sourceType}`}
              secondary={new Date(transfer.created).toLocaleDateString()}
            />
          </ListItem>
        ))}
      </List>

      {pendingTransfers.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Pending Transfers
          </Typography>
          <List>
            {pendingTransfers.map((transfer) => (
              <ListItem key={transfer.id}>
                <ListItemText
                  primary={`$${(transfer.amount / 100).toFixed(2)} - ${transfer.sourceType}`}
                  secondary="Awaiting delivery confirmation"
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: theme.shape.borderRadius * 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Your Balance
        </Typography>
        <Typography variant="h3" align="center" color="primary" gutterBottom>
          ${((balance) / 100).toFixed(2)}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Payout History
          </Typography>
          <List>
            {payoutHistory.map((payout) => (
              <ListItem key={payout.id}>
                <ListItemText
                  primary={`$${(payout.amount / 100).toFixed(2)}`}
                  secondary={new Date(payout.date).toLocaleDateString()}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {renderTransactionHistory()}

        {!accountCreated && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Create Connected Account
            </Typography>
            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
              required
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateAccount}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Create Account
            </Button>
          </Box>
        )}

        {accountCreated && !bankAccountAdded && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Add Bank Account
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Account Holder Name"
                  variant="outlined"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Account Number"
                  variant="outlined"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountBalance />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Routing Number"
                  variant="outlined"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountBalance />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>
            </Grid>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddBankAccount}
              fullWidth
              sx={{ mt: 3, py: 1.5 }}
            >
              Add Bank Account
            </Button>
          </Box>
        )}

        {accountCreated && bankAccountAdded && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Request Payout
            </Typography>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              variant="outlined"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney />
                  </InputAdornment>
                ),
              }}
              required
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="success"
              onClick={handlePayoutRequest}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Request Payout
            </Button>
          </Box>
        )}

        {message && (
          <Alert severity="info" sx={{ mt: 4 }}>
            {message}
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default Payouts;
