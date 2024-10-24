import React, { useState } from 'react';
import { createBlogPost } from '../Services/blogs';
import { useNavigate } from 'react-router-dom';

const CreateBlogPost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token'); // Assuming you're storing the token in localStorage

    if (!token) {
      setError('You need to be logged in to create a blog post');
      return;
    }

    try {
      const postData = { title, content, createdAt: new Date() };
      await createBlogPost(postData, token); // Pass the token to the API
      navigate('/blogs'); // Redirect to blog list after creation
    } catch (err) {
      setError('Failed to create blog post');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Create Feild Note</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
          />
        </div>
        <div className="form-group mb-3">
          <textarea
            className="form-control"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your content here"
            required
            rows="5"
          />
        </div>
        <button type="submit" className="btn btn-primary">Create Feild Note</button>
      </form>
    </div>
  );  
};

export default CreateBlogPost;
