import React from "react";
import { Typography, Grid, Box, Divider } from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Details = ({ contract }) => {
  // Helper function to format address
  const formatAddress = (address) => {
    if (!address) return "No address provided";
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Contract Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" color="textSecondary">
            Product Type
          </Typography>
          <Typography variant="body1" gutterBottom>
            {contract.productType}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" color="textSecondary">
            Quantity
          </Typography>
          <Typography variant="body1" gutterBottom>
            {contract.quantity} units
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" color="textSecondary">
            Maximum Price
          </Typography>
          <Typography variant="body1" gutterBottom>
            ${contract.maxPrice}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" color="textSecondary">
            Status
          </Typography>
          <Typography variant="body1" gutterBottom>
            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
          </Typography>
        </Grid>

        {contract.deliveryMethod && (
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">
              Delivery Method
            </Typography>
            <Typography variant="body1" gutterBottom>
              {contract.deliveryMethod.replace(/_/g, " ").toUpperCase()}
            </Typography>
          </Grid>
        )}

        {contract.deliveryAddress && (
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">
              Delivery Address
            </Typography>
            <Typography variant="body1" gutterBottom>
              {`${contract.deliveryAddress.street}, ${contract.deliveryAddress.city}, ${contract.deliveryAddress.state} ${contract.deliveryAddress.zipCode}`}
            </Typography>
          </Grid>
        )}

        {/* Buyer Location */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Buyer Information
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="subtitle1">
              {contract.buyer.username}'s Location
            </Typography>
          </Box>
          <Typography variant="body1" gutterBottom>
            {contract.buyerLocation ? 
              formatAddress(contract.buyerLocation.address) : 
              formatAddress(contract.buyer.address)}
          </Typography>
        </Grid>

        {/* Farmer Location (if contract is fulfilled) */}
        {contract.status !== 'open' && contract.winningFulfillment && (
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Farmer Information
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOnIcon sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="subtitle1">
                Farmer's Location
              </Typography>
            </Box>
            <Typography variant="body1" gutterBottom>
              {contract.winningFulfillment.farmerLocation ? 
                formatAddress(contract.winningFulfillment.farmerLocation.address) : 
                "Location information not available"}
            </Typography>
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default Details;
