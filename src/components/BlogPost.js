import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBlogPost, addCommentToBlogPost } from '../Services/blogs';

const BlogPost = () => {
  const { id } = useParams();
  const [blogPost, setBlogPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      const response = await getBlogPost(id);
      setBlogPost(response.data);
      setComments(response.data.comments || []); // Load existing comments
    };
    fetchBlog();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addCommentToBlogPost(id, { content: comment });
      setComments([...comments, response.data]);
      setComment(''); // Clear comment input after submission
    } catch (err) {
      console.error('Failed to comment');
    }
  };

  if (!blogPost) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{blogPost.title}</h2>
      <p>{blogPost.content}</p>

      <h3>Comments</h3>
      {comments.length > 0 ? (
        <ul>
          {comments.map((com, index) => (
            <li key={index}>{com.content}</li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}

      <form onSubmit={handleCommentSubmit}>
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment"
          required
        />
        <button type="submit">Add Comment</button>
      </form>
    </div>
  );
};

export default BlogPost;
