import React from "react";
import { Card, CardContent, Typography, Button, Grid, Box } from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';

const FullfilmentCard = ({ contract, userRole, userId, initiateCheckout }) => {
  const { fulfillments, buyer, status, paymentStatus, quantity } = contract;

  // Helper function to format address
  const formatAddress = (address) => {
    if (!address) return "No address provided";
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  if (fulfillments?.length > 0) {
    return fulfillments.map((fulfillment) => {
      const isAcceptable =
        userRole === "buyer" &&
        buyer._id === userId &&
        status === "open" &&
        fulfillment.status === "pending" &&
        paymentStatus === "pending";
      const totalAmount =
        fulfillment.price * quantity + (fulfillment.deliveryFee || 0);
      return (
        <>
          <Typography variant="h6" gutterBottom>
            Fulfillments
          </Typography>

          <Card key={fulfillment._id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Farmer
                  </Typography>
                  <Typography variant="body1">
                    {fulfillment.farmer.username}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Price Per Unit
                  </Typography>
                  <Typography variant="body1">${fulfillment.price}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total: ${totalAmount.toFixed(2)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Delivery Method
                  </Typography>
                  <Typography variant="body1">
                    {fulfillment.deliveryMethod
                      .replace(/_/g, " ")
                      .toUpperCase()}
                  </Typography>
                  {fulfillment.deliveryFee > 0 && (
                    <Typography variant="body2" color="textSecondary">
                      Delivery Fee: ${fulfillment.deliveryFee}
                    </Typography>
                  )}
                </Grid>

                {/* Farmer Location */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <LocationOnIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="subtitle2" color="textSecondary">
                      Farmer's Location
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {fulfillment.farmerLocation ? 
                      formatAddress(fulfillment.farmerLocation.address) : 
                      formatAddress(fulfillment.farmer.address)}
                  </Typography>
                </Grid>

                {fulfillment.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">{fulfillment.notes}</Typography>
                  </Grid>
                )}

                {fulfillment.estimatedDeliveryDate && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Estimated Delivery
                    </Typography>
                    <Typography variant="body1">
                      {new Date(
                        fulfillment.estimatedDeliveryDate
                      ).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color:
                        fulfillment.status === "accepted"
                          ? "success.main"
                          : fulfillment.status === "rejected"
                          ? "error.main"
                          : "text.primary",
                    }}
                  >
                    {fulfillment.status.toUpperCase()}
                  </Typography>
                </Grid>

                {isAcceptable && (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => initiateCheckout(fulfillment)}
                      sx={{ mt: 2 }}
                    >
                      Accept & Pay (${totalAmount.toFixed(2)})
                    </Button>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </>
      );
    });
  } else {
    return (
      <>
        <Typography variant="h6" gutterBottom>
          Fulfillments
        </Typography>
        <Typography color="textSecondary">No fulfillments yet</Typography>
      </>
    );
  }
};

export default FullfilmentCard;
