import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBlogPost } from '../Services/blogs'; // Correct import from services
import axios from 'axios';

const BlogPost = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const fetchedBlog = await getBlogPost(id);
        setBlog(fetchedBlog);
        setComments(fetchedBlog.comments || []); // Load existing comments
      } catch (error) {
        console.error("Error fetching blog post:", error);
      }
    };

    fetchBlog();
  }, [id]);

  const handleAddComment = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`http://localhost:5000/api/blogs/${id}/comments`, { content: newComment }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setComments([...comments, response.data]); // Add the new comment to the list
      setNewComment(''); // Clear input field
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (!blog) return <p>Loading...</p>;

  return (
    <div>
      <h2>{blog.title}</h2>
      <p>{blog.content}</p>
      <p>Posted by: {blog.authorRole}</p>

      <h3>Comments</h3>
      {comments.length > 0 ? (
        <ul>
          {comments.map((comment, index) => (
            <li key={index}>{comment.content}</li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}

      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment"
      />
      <button onClick={handleAddComment}>Post Comment</button>
    </div>
  );
};

export default BlogPost;
