import React from "react";
import { Typography, Grid } from "@mui/material";
const Details = ({ contract }) => {
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
      </Grid>
    </>
  );
};

export default Details;
