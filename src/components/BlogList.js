import React, { useState, useEffect } from 'react';
import { getBlogPosts } from '../Services/blogs';  // Ensure correct service path
import CreateBlogPost from './CreateBlogPost';      // Correctly import local component

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await getBlogPosts();
      setBlogs(response);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  // Handle refreshing the blog list after a new post is created
  const handleBlogCreated = (newBlog) => {
    setBlogs((prevBlogs) => [...prevBlogs, newBlog]);
    setShowCreateForm(false); // Hide the form after creation
  };

  return (
    <div>
      <h2>Blog Posts</h2>

      {/* Toggle for blog post creation form */}
      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Cancel' : 'Create Blog Post'}
      </button>

      {showCreateForm && <CreateBlogPost onBlogCreated={handleBlogCreated} />}

      {blogs.length ? (
        <ul>
          {blogs.map((blog) => (
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
