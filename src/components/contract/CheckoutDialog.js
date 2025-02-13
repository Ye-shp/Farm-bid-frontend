import React from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import PaymentForm from "../payment/PaymentForm";
const CheckoutDialog = ({
  showCheckoutDialog,
  setShowCheckoutDialog,
  handleAcceptFulfillment,
  selectedFulfillment,
  contract,
  contractId,
}) => {
  return (
    <Dialog
      open={showCheckoutDialog}
      onClose={() => setShowCheckoutDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Complete Purchase</DialogTitle>
      <DialogContent>
        {selectedFulfillment && (
          <PaymentForm
            amount={
              selectedFulfillment.price * contract.quantity +
              (selectedFulfillment.deliveryFee || 0)
            }
            sourceType="contract"
            sourceId={contractId}
            sellerId={selectedFulfillment.farmer._id}
            onSuccess={() => handleAcceptFulfillment(selectedFulfillment._id)}
            onError={(error) => console.error("Payment error:", error)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
