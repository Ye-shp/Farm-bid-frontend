import React, { useEffect, useState } from 'react';
import { getBlogPost, addComment } from '../Services/blogs';
import { useParams } from 'react-router-dom';

const BlogPost = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await getBlogPost(id);
        setBlog(response.data);
      } catch (error) {
        console.error('Error fetching blog:', error);
      }
    };
    fetchBlog();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addComment(id, { content: comment });
      setBlog((prevBlog) => ({
        ...prevBlog,
        comments: [...prevBlog.comments, response.data],
      }));
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (!blog) return <p>Loading...</p>;

  return (
    <div>
      <h2>{blog.title}</h2>
      <p>Posted by {blog.user.email}</p>
      <p>{blog.content}</p>

      <h3>Comments</h3>
      {blog.comments.map((comment, index) => (
        <div key={index}>
          <p>{comment.user.email}: {comment.content}</p>
        </div>
      ))}

      <form onSubmit={handleCommentSubmit}>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment"
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default BlogPost;
