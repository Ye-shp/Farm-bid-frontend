import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  TextField,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import PaymentService from "../../Services/paymentService";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const PayoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bankAccountDetails, setBankAccountDetails] = useState({
    accountNumber: "",
    routingNumber: "",
    holderName: "",
  });
  const [addingBank, setAddingBank] = useState(false);
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [accountDetails, setAccountDetails] = useState({
    email: "",
    businessName: "",
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const balanceData = await PaymentService.getSellerBalance();
        if (balanceData.redirectToConnectedAccount) {
          // Redirect to the connected account creation page if no account exists
          navigate("/create-connected-account");
          return;
        }
        setBalance(balanceData);

        const transfersData = await PaymentService.getSellerTransfers();
        if (transfersData.redirectToConnectedAccount) {
          navigate("/create-connected-account");
          return;
        }
        setTransfers(transfersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleAddBankAccount = async () => {
    setAddingBank(true);
    try {
      // We need to get the balance first to ensure we have the connected account
      const balanceData = await PaymentService.getSellerBalance();
      if (balanceData.redirectToConnectedAccount) {
        navigate("/create-connected-account");
        return;
      }

      await PaymentService.addBankAccount({
        accountId: balanceData.stripeAccountId, // Add the account ID
        bankAccountDetails
      });
      
      // Refresh balance after adding bank account
      const updatedBalance = await PaymentService.getSellerBalance();
      setBalance(updatedBalance);
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingBank(false);
    }
  };

  const handleRequestPayout = async () => {
    setRequestingPayout(true);
    try {
      // Get latest balance to ensure we have funds to pay out
      const balanceData = await PaymentService.getSellerBalance();
      if (balanceData.redirectToConnectedAccount) {
        navigate("/create-connected-account");
        return;
      }

      // Check if there are available funds
      const availableAmount = balanceData.available?.[0]?.amount || 0;
      if (availableAmount <= 0) {
        setError("No funds available for payout");
        return;
      }

      // Request payout of available balance
      await PaymentService.requestPayout({
        amount: availableAmount / 100, // Convert from cents to dollars
        currency: balanceData.available[0].currency,
        accountId: balanceData.stripeAccountId
      });

      // Refresh data after payout
      const updatedBalance = await PaymentService.getSellerBalance();
      const updatedTransfers = await PaymentService.getSellerTransfers();
      
      setBalance(updatedBalance);
      setTransfers(updatedTransfers);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setRequestingPayout(false);
    }
  };

  const handleCreateConnectedAccount = async () => {
    setCreatingAccount(true);
    setError(null);
    try {
      const response = await PaymentService.createConnectedAccount({
        email: accountDetails.email || user.email, // Use user's email if not provided
        businessName: accountDetails.businessName,
        firstName: accountDetails.firstName,
        lastName: accountDetails.lastName,
      });

      // If successful, refresh the balance data which will now include the connected account
      const balanceData = await PaymentService.getSellerBalance();
      setBalance(balanceData);
      setActiveStep(1); // Move to bank account step
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingAccount(false);
    }
  };

  const renderConnectedAccountSetup = () => (
    <Box sx={{ mb: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Set Up Your Seller Account
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            <Step>
              <StepLabel>Create Account</StepLabel>
            </Step>
            <Step>
              <StepLabel>Add Bank Account</StepLabel>
            </Step>
            <Step>
              <StepLabel>Ready for Payouts</StepLabel>
            </Step>
          </Stepper>

          {activeStep === 0 && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                To receive payments, you'll need to set up a connected account with our payment processor.
              </Typography>
              
              <TextField
                fullWidth
                label="Email"
                margin="normal"
                value={accountDetails.email}
                onChange={(e) =>
                  setAccountDetails((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder={user.email}
                helperText="Leave blank to use your account email"
              />
              
              <TextField
                fullWidth
                label="Business Name"
                margin="normal"
                value={accountDetails.businessName}
                onChange={(e) =>
                  setAccountDetails((prev) => ({
                    ...prev,
                    businessName: e.target.value,
                  }))
                }
              />
              
              <TextField
                fullWidth
                label="First Name"
                margin="normal"
                value={accountDetails.firstName}
                onChange={(e) =>
                  setAccountDetails((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
              />
              
              <TextField
                fullWidth
                label="Last Name"
                margin="normal"
                value={accountDetails.lastName}
                onChange={(e) =>
                  setAccountDetails((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
              />

              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateConnectedAccount}
                disabled={creatingAccount}
                sx={{ mt: 2 }}
              >
                {creatingAccount ? "Creating Account..." : "Create Account"}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  // Show connected account setup if no balance (meaning no connected account)
  if (!balance || balance.redirectToConnectedAccount) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Payout Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {renderConnectedAccountSetup()}
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Payout Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {balance && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">Current Balance</Typography>
            <Typography variant="h4">
            ${balance?.available?.toFixed(2) ?? '0.00'}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payout History
        </Typography>
        {transfers.length > 0 ? (
          transfers.map((transfer) => (
            <Card key={transfer.id} sx={{ mb: 1 }}>
              <CardContent>
                <Typography>
                  Amount: ${transfer.amount.toFixed(2)}
                </Typography>
                <Typography>Status: {transfer.status}</Typography>
                <Typography>
                  Date: {new Date(transfer.date).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography>No payouts yet.</Typography>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add Bank Account
        </Typography>
        <TextField
          fullWidth
          label="Account Number"
          margin="normal"
          value={bankAccountDetails.accountNumber}
          onChange={(e) =>
            setBankAccountDetails((prev) => ({
              ...prev,
              accountNumber: e.target.value,
            }))
          }
        />
        <TextField
          fullWidth
          label="Routing Number"
          margin="normal"
          value={bankAccountDetails.routingNumber}
          onChange={(e) =>
            setBankAccountDetails((prev) => ({
              ...prev,
              routingNumber: e.target.value,
            }))
          }
        />
        <TextField
          fullWidth
          label="Account Holder Name"
          margin="normal"
          value={bankAccountDetails.holderName}
          onChange={(e) =>
            setBankAccountDetails((prev) => ({
              ...prev,
              holderName: e.target.value,
            }))
          }
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddBankAccount}
          disabled={addingBank}
          sx={{ mt: 2 }}
        >
          {addingBank ? "Adding Bank Account..." : "Add Bank Account"}
        </Button>
      </Box>

      <Box>
        <Button
          variant="contained"
          color="success"
          fullWidth
          onClick={handleRequestPayout}
          disabled={requestingPayout}
        >
          {requestingPayout ? "Processing Payout..." : "Request Payout"}
        </Button>
      </Box>
    </Box>
  );
};

export default PayoutPage;
