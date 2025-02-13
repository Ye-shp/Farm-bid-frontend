import React from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import {
  Box,
  Typography,
  Button,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
const SubmitOfferButton = ({
  display,
  contract,
  showFulfillDialog,
  setShowFulfillDialog,
  handleSubmitFulfillment,
}) => {
  const fulfillmentSchema = Yup.object().shape({
    price: Yup.number()
      .required("Required")
      .positive("Must be positive")
      .max(contract.maxPrice, "Price exceeds maximum allowed"),
    deliveryMethod: Yup.string().required("Required"),
    estimatedDeliveryDate: Yup.date()
      .required("Required")
      .min(new Date(), "Delivery date must be in the future"),
    deliveryFee: Yup.number().min(0, "Cannot be negative"),
    notes: Yup.string(),
  });
  if (!display) return null;
  return (
    <Box sx={{ mt: 4 }}>
      <Divider sx={{ mb: 3 }} />
      <Typography variant="h6" gutterBottom>
        Submit Your Offer
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowFulfillDialog(true)}
        sx={{ mb: 3 }}
      >
        Submit Fulfillment Offer
      </Button>

      <Dialog
        open={showFulfillDialog}
        onClose={() => setShowFulfillDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Submit Fulfillment Offer</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              price: "",
              deliveryMethod: "farmer_delivery",
              deliveryFee: 0,
              estimatedDeliveryDate: "",
              notes: "",
            }}
            validationSchema={fulfillmentSchema}
            onSubmit={handleSubmitFulfillment}
          >
            {({ errors, touched }) => (
              <Form>
                <Field name="price">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      margin="normal"
                      label="Price per unit"
                      type="number"
                      inputProps={{ step: "0.01" }}
                      error={touched.price && !!errors.price}
                      helperText={touched.price && errors.price}
                    />
                  )}
                </Field>

                <Field name="deliveryMethod">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      margin="normal"
                      label="Delivery Method"
                      select
                      error={touched.deliveryMethod && !!errors.deliveryMethod}
                      helperText={
                        touched.deliveryMethod && errors.deliveryMethod
                      }
                    >
                      <MenuItem value="buyer_pickup">Buyer Pickup</MenuItem>
                      <MenuItem value="farmer_delivery">
                        Farmer Delivery
                      </MenuItem>
                      <MenuItem value="third_party">Third Party</MenuItem>
                    </TextField>
                  )}
                </Field>

                <Field name="deliveryFee">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      margin="normal"
                      label="Delivery Fee"
                      type="number"
                      inputProps={{ step: "0.01" }}
                      error={touched.deliveryFee && !!errors.deliveryFee}
                      helperText={touched.deliveryFee && errors.deliveryFee}
                    />
                  )}
                </Field>

                <Field name="estimatedDeliveryDate">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      margin="normal"
                      label="Estimated Delivery Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={
                        touched.estimatedDeliveryDate &&
                        !!errors.estimatedDeliveryDate
                      }
                      helperText={
                        touched.estimatedDeliveryDate &&
                        errors.estimatedDeliveryDate
                      }
                    />
                  )}
                </Field>

                <Field name="notes">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      margin="normal"
                      label="Additional Notes"
                      multiline
                      rows={3}
                    />
                  )}
                </Field>

                <DialogActions sx={{ mt: 2 }}>
                  <Button onClick={() => setShowFulfillDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" color="primary">
                    Submit Offer
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SubmitOfferButton;
