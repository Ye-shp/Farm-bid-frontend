// src/components/FeatureRequest.js
import React, { useState } from 'react';
import './FeatureRequest.css';

const FeatureRequest = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feature: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Feature Request Submitted:', formData);
    // Add logic to submit the form data to the backend
    alert('Feature request submitted successfully!');
    setFormData({ name: '', email: '', feature: '' });
  };

  return (
    <div className="feature-request-container">
      <h1>Feature Request</h1>
      <p>We value your feedback! Please let us know any features you’d like to see in Farm Bid.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Feature Request:
          <textarea
            name="feature"
            value={formData.feature}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default FeatureRequest;
