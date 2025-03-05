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
import ConnectedAccount from "./ConnectedAccount";

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
        setLoading(true);
        setError(null);
        
        const balanceData = await PaymentService.getSellerBalance();
        console.log('Balance Data:', balanceData); // For debugging
        
        // If we get a redirect response, we need to create a connected account
        if (balanceData.redirect === '/create-connected-account') {
          setActiveStep(0);
          setLoading(false);
          return;
        }

        // Store the balance data
        setBalance(balanceData);

        try {
          // Get transfer history
          const transfersData = await PaymentService.getSellerTransfers();
          setTransfers(transfersData);
        } catch (transferError) {
          console.error('Transfer fetch error:', transferError);
          // Don't fail completely if transfers can't be fetched
        }

        // Check for bank accounts
        const hasExternalAccounts = balanceData.external_accounts?.data?.length > 0;
        
        if (!hasExternalAccounts) {
          setActiveStep(1); // Show bank account setup
        } else {
          setActiveStep(2); // Show dashboard
        }

      } catch (err) {
        console.error('Fetch error:', err);
        // If the error indicates we need a connected account, show step 0
        if (err.response?.status === 401) {
          // Handle authentication errors
          setError('Please log in again to continue');
        } else if (err.response?.redirect === '/create-connected-account' || !err.response) {
          setActiveStep(0);
        } else {
          setError(err.message || 'An error occurred while fetching data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateConnectedAccount = async () => {
    setCreatingAccount(true);
    setError(null);
    try {
      await PaymentService.createConnectedAccount({
        email: accountDetails.email || user.email,
        businessName: accountDetails.businessName,
        firstName: accountDetails.firstName,
        lastName: accountDetails.lastName,
      });

      setActiveStep(1); // Move to bank account step after successful creation
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingAccount(false);
    }
  };

  const handleAddBankAccount = async () => {
    setAddingBank(true);
    try {
      const balanceData = await PaymentService.getSellerBalance();
      
      await PaymentService.addBankAccount({
        accountId: balanceData.stripeAccountId,
        bankAccountDetails
      });
      
      setActiveStep(2); // Move to final step after adding bank account
      
      // Refresh balance data
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
            <ConnectedAccount 
              onSuccess={() => {
                setActiveStep(1);
                // Refresh balance data after connected account creation
                fetchData();
              }}
            />
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Add your bank account to receive payouts
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
          )}
        </CardContent>
      </Card>
    </Box>
  );

  // Render function to determine what to show
  const renderContent = () => {
    // If we're still loading, show spinner
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      );
    }

    // If we need to set up connected account or bank account, show setup flow
    if (activeStep < 2) {
      return renderConnectedAccountSetup();
    }

    // If everything is set up, show the payout dashboard
    return (
      <>
        {balance && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">Current Balance</Typography>
              <Typography variant="h4">
                ${(balance?.available?.[0]?.amount / 100).toFixed(2) ?? '0.00'}
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
                    Amount: ${(transfer.amount / 100).toFixed(2)}
                  </Typography>
                  <Typography>Status: {transfer.status}</Typography>
                  <Typography>
                    Date: {new Date(transfer.created * 1000).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography>No payouts yet.</Typography>
          )}
        </Box>

        <Box>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={handleRequestPayout}
            disabled={requestingPayout || !balance?.available?.[0]?.amount}
          >
            {requestingPayout ? "Processing Payout..." : "Request Payout"}
          </Button>
        </Box>
      </>
    );
  };

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

      {renderContent()}
    </Box>
  );
};

export default PayoutPage;
