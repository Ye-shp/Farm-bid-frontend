// src/components/CreateBlogPost.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateBlogPost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Post the new blog to the API or save locally
    fetch('/api/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    })
      .then(response => response.json())
      .then(data => {
        // Redirect to the blog list after successful post creation
        navigate('/blog');
      });
  };

  return (
    <div>
      <h1>Create New Blog Post</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required />
        </div>
        <button type="submit">Create Post</button>
      </form>
    </div>
  );
};

export default CreateBlogPost;
