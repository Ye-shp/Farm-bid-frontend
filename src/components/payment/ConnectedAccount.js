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

const ConnectedAccount = ({ onSuccess }) => {
  const { user } = useAuth();

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
      const data = { 
        email,
        firstName: user?.firstName,
        lastName: user?.lastName
      };
      const response = await PaymentService.createConnectedAccount(data);
      if (response.accountId) {
        setSuccess(response.message);
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500); // Give user time to see success message
        }
      }
    } catch (err) {
      console.error('Connected account error:', err);
      setError(err.message || 'Failed to create connected account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="body1" gutterBottom>
        To receive payouts directly, please create your Stripe connected account.
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

export default ConnectedAccount;
