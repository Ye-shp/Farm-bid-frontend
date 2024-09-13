// src/components/BlogList.js
import React, { useState, useEffect } from 'react';
import { getBlogPosts } from '../Services/blogs';
import CreateBlogPost from './CreateBlogPost';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false); // Toggle for create form

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await getBlogPosts();
        setBlogs(response);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div>
      <h2>Blog Posts</h2>

      {/* Button to toggle create blog form */}
      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Cancel' : 'Create Blog Post'}
      </button>

      {/* Conditionally render blog creation form */}
      {showCreateForm && <CreateBlogPost />}

      {/* Display list of blog posts */}
      {blogs.length ? (
        <ul>
          {blogs.map(blog => (
            <li key={blog._id}>
              <h3>{blog.title}</h3>
              <p>{blog.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No blog posts available</p>
      )}
    </div>
  );
};

export default BlogList;
