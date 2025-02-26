import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ProductList from "./components/ProductList";
import ProductDetails from "./components/ProductDetails";
import BuyerDashboard from "./components/BuyerDashboard";
import FarmerDashboard from "./components/FarmerDashboard";
import BlogList from "./components/BlogList";
import BlogPost from "./components/BlogPost";
import CreateBlogPost from "./components/CreateBlogPost";
import FarmerAuctions from "./components/FarmerAuctions";
import UserProfile from "./components/UserProfile";
import PaymentForm from "./components/payment/PaymentForm";
import TransactionStatus from "./components/payment/TransactionStatus";
import FeaturedFarms from "./components/FeaturedFarms";
import CreateContract from "./components/CreateContract";
import Contracts from "./components/Contracts";
import ContractDetails from "./components/contract/ContractContainer";
import FulfillContract from "./components/FulfillContract";
import SearchBar from "./components/SearchBar";
import { SocketProvider } from "./context/SocketContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import { CircularProgress } from "@mui/material";
import PayoutPage from "./components/payment/PayoutPage";
import ProductInventory from "./components/ProductInventory";

const stripePromise = loadStripe(
  "pk_live_51Q9hx7ApVL7y3rvg85x9cvnfNETqgxw7qYxRrBJeD7rOg0d0M0WJnNMRF4TouN5RYAgwQ0HfQefNwZ5AEGXPIlF600UXzQ8rKx"
);

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <CircularProgress />;
  }

  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" />;
    }

    return children;
  };

  const LoginRoute = () => {
    if (user) {
      if (user.role === "farmer") {
        return <Navigate to="/farmer-dashboard" />;
      } else if (user.role === "buyer") {
        return <Navigate to="/buyer-dashboard" />;
      }
    }
    return <LoginPage />;
  };

  return (
    <>
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/featured-farms" element={<FeaturedFarms />} />

        {/* Profile Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:userId"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Require Login */}
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          }
        />

        {/* Farmer Routes */}
        <Route
          path="/farmer-dashboard"
          element={
            <ProtectedRoute allowedRoles={["farmer"]}>
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />
         <Route
          path="/PayoutPage"
          element={
            <ProtectedRoute allowedRoles={["farmer"]}>
              <PayoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-blog"
          element={
            <ProtectedRoute allowedRoles={["farmer"]}>
              <CreateBlogPost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auctions"
          element={
            <ProtectedRoute allowedRoles={["farmer"]}>
              <FarmerAuctions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fulfill-contract/:contractId"
          element={
            <ProtectedRoute allowedRoles={["farmer"]}>
              <FulfillContract />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id/inventory"
          element={
            <ProtectedRoute allowedRoles={["farmer"]}>
              <ProductInventory />
            </ProtectedRoute>
          }
        />

        {/* Buyer Routes */}
        <Route
          path="/buyer-dashboard"
          element={
            <ProtectedRoute allowedRoles={["buyer"]}>
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/create-blog"
          element={
            <ProtectedRoute allowedRoles={["buyer"]}>
              <CreateBlogPost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-contract"
          element={
            <ProtectedRoute allowedRoles={["buyer"]}>
              <CreateContract />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={["buyer"]}>
              <Elements stripe={stripePromise}>
                <PaymentForm />
              </Elements>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transaction-status"
          element={
            <ProtectedRoute>
              <TransactionStatus />
            </ProtectedRoute>
          }
        />

        {/* Shared Protected Routes */}
        <Route
          path="/contracts"
          element={
            <ProtectedRoute>
              <Contracts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contracts/:contractId"
          element={
            <ProtectedRoute>
              <ContractDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="App">
            <AppRoutes />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
