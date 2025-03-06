import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import PaymentService from "../../Services/paymentService";
import { useAuth } from "../../contexts/AuthContext";

const ConnectedAccount = ({ onSuccess }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: "",
    dob: {
      day: "",
      month: "",
      year: "",
    },
    address: {
      line1: "",
      city: "",
      state: "",
      postalCode: "",
    },
    ssn: "", // Last 4 digits only
    businessProfile: {
      url: "",
      mcc: "5812", // Default MCC for restaurants/food service
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (field, value) => {
    const fields = field.split(".");
    if (fields.length === 1) {
      setFormData((prev) => ({ ...prev, [field]: value }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [fields[0]]: {
          ...prev[fields[0]],
          [fields[1]]: value,
        },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dob: formData.dob,
        address: {
          line1: formData.address.line1,
          city: formData.address.city,
          state: formData.address.state,
          postal_code: formData.address.postalCode,
        },
        ssn_last_4: formData.ssn,
        business_profile: {
          url: formData.businessProfile.url,
          mcc: formData.businessProfile.mcc,
        },
        tos_acceptance: {
          date: Math.floor(Date.now() / 1000),
          ip: "127.0.0.1", // This should be the user's actual IP address
        },
      };

      const response = await PaymentService.createConnectedAccount(data);
      if (response.accountId) {
        setSuccess(response.message);
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
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
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <SecurityIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" component="h1">
            Secure Payment Account Setup
          </Typography>
        </Box>

        <Typography variant="body1" paragraph>
          To ensure you can receive payments securely and directly to your bank account, we need to set up your payment account through Stripe, our trusted payment processor.
        </Typography>

        <Accordion defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center">
              <InfoIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="h6">Why We Need This Information</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              As a marketplace connecting farmers with buyers, we are required by financial regulations to verify the identity of all sellers on our platform. This helps:
            </Typography>
            <ul>
              <li>
                <Typography>
                  Protect you and your business from fraud
                </Typography>
              </li>
              <li>
                <Typography>
                  Ensure secure and direct deposits to your bank account
                </Typography>
              </li>
              <li>
                <Typography>
                  Comply with federal banking regulations and tax reporting requirements
                </Typography>
              </li>
            </ul>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center">
              <LockIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="h6">How We Protect Your Information</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              Your security is our top priority. Here's how we protect your information:
            </Typography>
            <ul>
              <li>
                <Typography paragraph>
                  <strong>Secure Encryption:</strong> All personal information is encrypted using bank-level security standards
                </Typography>
              </li>
              <li>
                <Typography paragraph>
                  <strong>Limited Access:</strong> We only collect the minimum required information and never store sensitive data like your full SSN
                </Typography>
              </li>
              <li>
                <Typography paragraph>
                  <strong>Trusted Partner:</strong> We use Stripe, a leading payment processor that works with millions of businesses worldwide
                </Typography>
              </li>
            </ul>
            <Typography>
              Learn more about{' '}
              <Link href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">
                Stripe's privacy policy
              </Link>
              {' '}and{' '}
              <Link href="https://stripe.com/connect-account/legal" target="_blank" rel="noopener noreferrer">
                terms of service
              </Link>.
            </Typography>
          </AccordionDetails>
        </Accordion>

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
          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                variant="outlined"
                fullWidth
                required
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                helperText="As it appears on your government ID"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                variant="outlined"
                fullWidth
                required
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                helperText="As it appears on your government ID"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                required
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                helperText="For payment notifications and account updates"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Phone"
                variant="outlined"
                fullWidth
                required
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                helperText="Required for account security and verification"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Date of Birth
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Required for identity verification and compliance with financial regulations
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Month"
                variant="outlined"
                fullWidth
                required
                type="number"
                inputProps={{ min: 1, max: 12 }}
                value={formData.dob.month}
                onChange={(e) => handleChange("dob.month", e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Day"
                variant="outlined"
                fullWidth
                required
                type="number"
                inputProps={{ min: 1, max: 31 }}
                value={formData.dob.day}
                onChange={(e) => handleChange("dob.day", e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Year"
                variant="outlined"
                fullWidth
                required
                type="number"
                inputProps={{ min: 1900, max: new Date().getFullYear() - 18 }}
                value={formData.dob.year}
                onChange={(e) => handleChange("dob.year", e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Business Address
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                This should be your farm or primary business location
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Street Address"
                variant="outlined"
                fullWidth
                required
                value={formData.address.line1}
                onChange={(e) => handleChange("address.line1", e.target.value)}
                helperText="Physical address where you conduct business"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                variant="outlined"
                fullWidth
                required
                value={formData.address.city}
                onChange={(e) => handleChange("address.city", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="State"
                variant="outlined"
                fullWidth
                required
                value={formData.address.state}
                onChange={(e) => handleChange("address.state", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="ZIP Code"
                variant="outlined"
                fullWidth
                required
                value={formData.address.postalCode}
                onChange={(e) => handleChange("address.postalCode", e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Identity Verification
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Required by federal regulations to prevent fraud and ensure secure payments
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Last 4 digits of SSN"
                variant="outlined"
                fullWidth
                required
                type="password"
                inputProps={{ maxLength: 4, pattern: "[0-9]*" }}
                value={formData.ssn}
                onChange={(e) => handleChange("ssn", e.target.value)}
                helperText="Used for identity verification only. We never store your full SSN."
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Business Details
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Website URL"
                variant="outlined"
                fullWidth
                required
                value={formData.businessProfile.url}
                onChange={(e) => handleChange("businessProfile.url", e.target.value)}
                helperText="Your farm's website or social media page"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="textSecondary" paragraph>
              By clicking "Create Payment Account", you agree to Stripe's{' '}
              <Link href="https://stripe.com/connect-account/legal" target="_blank" rel="noopener noreferrer">
                Connected Account Agreement
              </Link>
              , which includes the payment processing terms.
            </Typography>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ mt: 2 }}
              size="large"
            >
              {loading ? <CircularProgress size={24} /> : "Create Payment Account"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ConnectedAccount;
