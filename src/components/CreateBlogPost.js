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
    <div>
      <h2>Create Blog Post</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your content here"
          required
        />
        <button type="submit">Create Blog</button>
      </form>
    </div>
  );
};

export default CreateBlogPost;
