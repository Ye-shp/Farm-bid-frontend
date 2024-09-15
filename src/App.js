// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';  // Import Bootstrap CSS
import 'bootstrap/dist/js/bootstrap.bundle.min'; // Import Bootstrap JS bundle (includes Popper.js)
import Header from './components/Header';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import FarmerDashboard from './components/FarmerDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import FeatureRequest from './components/FeatureRequest';
import AboutUs from './components/AboutUs';
import BlogList from './components/BlogList'; // Blog listing
import BlogPost from './components/BlogPost'; // Single blog post
import CreateBlogPost from './components/CreateBlogPost'; // Create a new blog post

const App = () => {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
          <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
          <Route path="/blogs" element={<BlogList />} /> {/* Blog listing */}
          <Route path="/blog/:id" element={<BlogPost />} /> {/* Single blog post */}
          <Route path="/create-blog" element={<CreateBlogPost />} /> {/* Create a blog post */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
