import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBlogPosts} from '../Services/blogs'; // Correct import from services

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const fetchedBlogs = await getBlogPosts();
        setBlogs(fetchedBlogs);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div>
      <h2>Blogs</h2>
      <ul>
        {blogs.map(blog => (
          <li key={blog._id}>
            <Link to={`/blog/${blog._id}`}>
              {blog.title} - Posted by {blog.authorRole}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogList;
