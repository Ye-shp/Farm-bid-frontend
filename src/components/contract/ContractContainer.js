import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import TransactionStatus from "../payment/TransactionStatus";
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
import Details from "./Details";
import FullfilmentCard from "./FullfilmentCard";
import SubmitOfferButton from "./SubmitOfferButton";
import CheckoutDialog from "./CheckoutDialog";
const ContractDetails = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole] = useState(localStorage.getItem("role"));
  const [userId] = useState(localStorage.getItem("userId"));
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [selectedFulfillment, setSelectedFulfillment] = useState(null);
  const [showFulfillDialog, setShowFulfillDialog] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  // fetch contracts on page load
  useEffect(() => {
    fetchContractDetails();
  }, [contractId]);

  const fetchContractDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/open-contracts/${contractId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Contract details:", {
        contract: response.data,
        userRole,
        userId,
        isBuyer: response.data.buyer._id === userId,
      });

      setContract(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching contract:", error);
      setError(
        error.response?.data?.error || "Failed to load contract details"
      );
      setLoading(false);
    }
  };

  //farmers send their fulfillment request
  const handleSubmitFulfillment = async (values) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/open-contracts/${contractId}/fulfill`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchContractDetails();
      setShowFulfillDialog(false);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to submit fulfillment");
    }
  };

  //buyer accept farmer fullfilment
  const handleAcceptFulfillment = async (fulfillmentId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/open-contracts/${contractId}/fulfillments/${fulfillmentId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchContractDetails();
      setShowCheckoutDialog(false);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to accept fulfillment");
    }
  };

  //buyer pay for the fulfillment
  const initiateCheckout = (fulfillment) => {
    setSelectedFulfillment(fulfillment);
    setShowCheckoutDialog(true);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!contract) return <Alert severity="info">No contract found</Alert>;

  const isFarmer = userRole === "farmer";
  const hasExistingFulfillment = contract.fulfillments?.some(
    (f) => f.farmer._id === userId
  );
  const canFulfill =
    isFarmer && contract.status === "open" && !hasExistingFulfillment;
    
  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>

          {/* render contract details */}
          <Details contract={contract} />
          <Divider sx={{ my: 3 }} />

          {/* conditionally render fullfilment section for farmers and buyers */}
          <FullfilmentCard
            contract={contract}
            userRole={userRole}
            userId={userId}
            initiateCheckout={initiateCheckout}
          />

          {/* conditionally render offer button for farmers that meet conditions to fulfill the contract */}
          <SubmitOfferButton
            display={canFulfill}
            contract={contract}
            showFulfillDialog={showFulfillDialog}
            setShowFulfillDialog={setShowFulfillDialog}
            handleSubmitFulfillment={handleSubmitFulfillment}
          />
        </CardContent>
      </Card>

      {/* conditionally render a checkut dialog box */}
      <CheckoutDialog
        showCheckoutDialog={showCheckoutDialog}
        setShowCheckoutDialog={setShowCheckoutDialog}
        handleAcceptFulfillment={handleAcceptFulfillment}
        selectedFulfillment={selectedFulfillment}
        contract={contract}
        contractId={contractId}
      />
    </Box>
  );
};

export default ContractDetails;

{
}
