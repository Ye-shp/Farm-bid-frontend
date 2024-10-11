// src/components/ProductList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../Styles/ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('https://farm-bid-3998c30f5108.herokuapp.com/api/products/farmer-products');// need to fix authorization problem 
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="product-list">
      <h2>Products</h2>
      <div className="products">
        {products.map(product => (
          <div key={product.id} className="product-item">
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            <Link to={`/product/${product.id}`}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
