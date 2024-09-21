import React, { useState } from 'react';
import axios from 'axios';

const CreateBlogPost = ({ onBlogCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${window.location.origin}/api/blogs`, {
        title,
        content,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Blog post created successfully!');
      setTitle(''); // Clear form fields
      setContent('');
      if (onBlogCreated) {
        onBlogCreated(response.data); // Callback to refresh the blog list
      }
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
