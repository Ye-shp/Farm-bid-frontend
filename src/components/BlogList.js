import React, { useEffect, useState } from 'react';
import { getBlogPosts } from '../Services/blogs';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Blog.css';

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
    <div className="container mt-5">
      <h2 className="text-center mb-4">Field Notes</h2>
      
      {isLoggedIn && (
        <button 
          onClick={() => navigate('/create-blog')} 
          className="btn btn-primary mb-4 create-post-btn">
          Create New Field Note 
        </button>
      )}
  
      <div className="row">
        {blogs.map((blog) => (
          <div className="col-md-6 mb-4" key={blog._id}>
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">
                  <Link to={`/blog/${blog._id}`} className="text-decoration-none">
                    {blog.title}
                  </Link>
                </h3>
                <p className="card-text">Posted by <Link to={`/user/${blog.user._id}`}>{blog.user.username}</Link></p>
                <p className="card-text">{blog.content.slice(0, 100)}...</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
};

export default BlogList;
