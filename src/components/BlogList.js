import React, { useEffect, useState } from 'react';
import { getBlogPosts } from '../Services/blogs';
import { Link } from 'react-router-dom';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);

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
