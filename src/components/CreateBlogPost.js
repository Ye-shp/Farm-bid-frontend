import React, { useState } from 'react';
import { createBlogPost } from '../Services/blogs';
import { useNavigate } from 'react-router-dom';

const CreateBlogPost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createBlogPost({ title, content });
      navigate(`/blogs/${response.data._id}`);
    } catch (error) {
      console.error('Error creating blog post:', error);
    }
  };

  return (
    <div>
      <h2>Create a Blog Post</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Blog Title"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Blog Content"
          required
        />
        <button type="submit">Create Post</button>
      </form>
    </div>
  );
};

export default CreateBlogPost;
