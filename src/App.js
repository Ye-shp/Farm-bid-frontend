// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';  // Import Bootstrap CSS
import 'bootstrap/dist/js/bootstrap.bundle.min'; // Import Bootstrap JS bundle (includes Popper.js)
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Header from './components/Header';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import FarmerDashboard from './components/FarmerDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import BlogList from './components/BlogList'; // Blog listing
import BlogPost from './components/BlogPost'; // Single blog post
import CreateBlogPost from './components/CreateBlogPost'; // Create a new blog post
import FarmerAuctions from './components/FarmerAuctions';
import UserProfile from './components/UserProfile';
import CheckoutForm from './components/CheckoutForm';
import FeaturedFarms from './components/FeaturedFarms';
import Payouts from './components/Payout';
 

const stripePromise = loadStripe('pk_live_51Q9hx7ApVL7y3rvg85x9cvnfNETqgxw7qYxRrBJeD7rOg0d0M0WJnNMRF4TouN5RYAgwQ0HfQefNwZ5AEGXPIlF600UXzQ8rKx')


const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Manage login state using localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  return (
    <Router>
      <div>
        <Header isLoggedIn={isLoggedIn} userRole={userRole} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
          <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
          <Route path="/blogs" element={<BlogList />} /> {/* Blog listing */}
          <Route path="/blog/:id" element={<BlogPost />} /> {/* Single blog post */}
          <Route path="/create-blog" element={<CreateBlogPost />} /> {/* Create a blog post */}
          <Route path="/farmer-auctions" element={<FarmerAuctions />} />{/*Farmers live auctions */}
          <Route path="/user/:userId" element= {<UserProfile />} />
          <Route path="/profile/:userId" element={<UserProfile />} />{/*For following and unfollowing */}          
          <Route path="/Featuredfarms" element = {<FeaturedFarms/>} />            
          <Route path="/Payout" element={<Payouts/>}/>
           <Route 
            path="/CheckoutForm" 
            element={
              <Elements stripe={stripePromise}>
                <CheckoutForm />
              </Elements>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
