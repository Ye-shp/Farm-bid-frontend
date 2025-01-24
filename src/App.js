import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Header from './components/Header';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import FarmerDashboard from './components/FarmerDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import BlogList from './components/BlogList';
import BlogPost from './components/BlogPost';
import CreateBlogPost from './components/CreateBlogPost';
import FarmerAuctions from './components/FarmerAuctions';
import UserProfile from './components/UserProfile';
import CheckoutForm from './components/CheckoutForm';
import FeaturedFarms from './components/FeaturedFarms';
import Payout from './components/Payout';
import CreateContract from './components/CreateContract';
import Contracts from './components/Contracts';
import ContractDetails from './components/ContractDetails';
import FulfillContract from './components/FulfillContract';
import SearchBar from './components/SearchBar';
import { SocketProvider } from './context/SocketContext';

const stripePromise = loadStripe('pk_live_51Q9hx7ApVL7y3rvg85x9cvnfNETqgxw7qYxRrBJeD7rOg0d0M0WJnNMRF4TouN5RYAgwQ0HfQefNwZ5AEGXPIlF600UXzQ8rKx')

const ProtectedRoute = ({ children, isLoggedIn, userRole, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  // If we have a token and role in localStorage, consider the user logged in
  const isAuthenticated = token && role;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard instead of home
    if (role === 'farmer') {
      return <Navigate to="/farmer-dashboard" />;
    } else if (role === 'buyer') {
      return <Navigate to="/buyer-dashboard" />;
    }
    return <Navigate to="/" />;
  }
  
  return children;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  // Add a route guard for the login page
  const LoginRoute = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
      if (role === 'farmer') {
        return <Navigate to="/farmer-dashboard" />;
      } else if (role === 'buyer') {
        return <Navigate to="/buyer-dashboard" />;
      }
    }
    return <LoginPage setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />;
  };

  return (
    <Router>
      <SocketProvider>
        <div>
          <Header isLoggedIn={isLoggedIn} userRole={userRole} />
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
            <Route path="/profile" element={
              <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole}>
                <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="/users/:userId" element={
              <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole}>
                <UserProfile />
              </ProtectedRoute>
            } />

            {/* Protected Routes - Require Login */}
            <Route path="/products/:id" element={
              <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole}>
                <ProductDetails />
              </ProtectedRoute>
            } />

            {/* Farmer Routes */}
            <Route path="/farmer-dashboard" element={
              <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['farmer']}>
                <FarmerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/create-blog" element={
              <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['farmer']}>
                <CreateBlogPost />
              </ProtectedRoute>
            } />
            <Route path="/auctions" element={
              <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['farmer']}>
                <FarmerAuctions />
              </ProtectedRoute>
            } />
            <Route path="/payout" element={
              <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['farmer']}>
                <Payout />
              </ProtectedRoute>
            } />
            <Route path="/fulfill-contract/:contractId" element={
              <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['farmer']}>
                <FulfillContract />
              </ProtectedRoute>
            } />

            {/* Buyer Routes */}
            <Route path="/buyer-dashboard" element={
              <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['buyer']}>
                <BuyerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/buyer/create-blog" element={
              <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['buyer']}>
                <CreateBlogPost />
              </ProtectedRoute>
            } />
            <Route path="/create-contract" element={
              <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['buyer']}>
                <CreateContract />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['buyer']}>
                <Elements stripe={stripePromise}>
                  <CheckoutForm />
                </Elements>
              </ProtectedRoute>
            } />

            {/* Shared Protected Routes */}
            <Route path="/contracts" element={
              <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole}>
                <Contracts />
              </ProtectedRoute>
            } />
            <Route path="/contracts/:contractId" element={
              <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole}>
                <ContractDetails />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </SocketProvider>
    </Router>
  );
};

export default App;
