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
      await PaymentService.addBankAccount(bankAccountDetails);
      const balanceData = await PaymentService.getSellerBalance();
      if (balanceData.redirectToConnectedAccount) {
        navigate("/create-connected-account");
        return;
      }
      setBalance(balanceData);
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingBank(false);
    }
  };

  const handleRequestPayout = async () => {
    setRequestingPayout(true);
    try {
      await PaymentService.requestPayout({});
      const balanceData = await PaymentService.getSellerBalance();
      if (balanceData.redirectToConnectedAccount) {
        navigate("/create-connected-account");
        return;
      }
      const transfersData = await PaymentService.getSellerTransfers();
      if (transfersData.redirectToConnectedAccount) {
        navigate("/create-connected-account");
        return;
      }
      setBalance(balanceData);
      setTransfers(transfersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setRequestingPayout(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
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
