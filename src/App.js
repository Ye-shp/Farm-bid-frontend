// src/App.js
// Home page and Login page are spelled different 
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Homepage from './components/Homepage';
import Loginpage from './components/Loginpage';
import RegisterPage from './components/RegisterPage';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import Dashboard from './components/Dashboard';

const App = () => (
  <Router>
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  </Router>
);

export default App;
