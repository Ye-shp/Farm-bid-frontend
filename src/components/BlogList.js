import React, { useEffect, useState } from 'react';
import { getBlogPosts } from '../Services/blogs';
import { Link, useNavigate } from 'react-router-dom';
import './Blog.css'
const BlogList = ({ isLoggedIn }) => {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await getBlogPosts();
        setBlogs(response.data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div>
      <h2>Blog Posts</h2>
      
      {/* Show the "Create Blog Post" button only if the user is logged in */}
      {isLoggedIn && (
        <button onClick={() => navigate('/create-blog')} className="create-post-btn">
          Create New Blog Post
        </button>
      )}

      {blogs.map((blog) => (
        <div key={blog._id}>
          <h3>
            <Link to={`/blogs/${blog._id}`}>{blog.title}</Link>
          </h3>
          <p>Posted by <Link to={`/user/${blog.user._id}`}>{blog.user.email}</Link></p>
          <p>{blog.content}</p>
        </div>
      ))}
    </div>
  );
};

export default BlogList;
