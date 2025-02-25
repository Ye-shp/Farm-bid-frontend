import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import PaymentService from "../../Services/paymentService";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const CreateConnectedAccountPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Pre-populate with user's email if available
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Pass email as required to create a connected account
      const data = { email };
      const response = await PaymentService.createConnectedAccount(data);
      if (response.accountId) {
        setSuccess(response.message);
        // After a short delay, redirect the seller back to the payout page
        setTimeout(() => {
          navigate("/payout");
        }, 2000);
      }
    } catch (err) {
      setError(err.message || "Failed to create connected account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3} maxWidth={600} mx="auto">
      <Typography variant="h4" gutterBottom>
        Create Connected Account
      </Typography>
      <Typography variant="body1" gutterBottom>
        To receive payouts directly, please create your Stripe connected
        account.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          required
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Create Connected Account"}
        </Button>
      </form>
    </Box>
  );
};

export default CreateConnectedAccountPage;
