import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBlogPost } from '../Services/blogs'; // Correct import from services

const BlogPost = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const fetchedBlog = await getBlogPost(id);
        setBlog(fetchedBlog);
      } catch (error) {
        console.error("Error fetching blog post:", error);
      }
    };

    fetchBlog();
  }, [id]);

  if (!blog) return <p>Loading...</p>;

  return (
    <div>
      <h2>{blog.title}</h2>
      <p>{blog.content}</p>
      <p>Posted by: {blog.authorRole}</p>
    </div>
  );
};

export default BlogPost;
