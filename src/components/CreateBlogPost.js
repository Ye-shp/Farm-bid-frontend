import React, { useState } from 'react';
import axios from 'axios'; // To make API requests
import { createBlogPost } from '../Services/blogs'; 


const CreateBlogPost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); // Get the user's token
      const response = await axios.post('http://localhost:5000/api/blogs', {
        title,
        content,
      }, {
        headers: { Authorization: `Bearer ${token}` } // Add token in the request
      });

      alert('Blog post created successfully!');
      setTitle(''); // Clear the form fields
      setContent('');
    } catch (error) {
      setError('Error creating blog post');
    }
  };

  return (
    <div>
      <h2>Create Blog Post</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default CreateBlogPost;
