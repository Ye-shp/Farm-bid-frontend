import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBlogPost, addCommentToBlogPost } from '../Services/blogs';

const BlogPost = () => {
  const { id } = useParams();
  const [blogPost, setBlogPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');

  // Fetch blog post and comments
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await getBlogPost(id);
        setBlogPost(response.data);
        setComments(response.data.comments || []); // Load comments
      } catch (err) {
        console.error('Error fetching blog post:', err);
      }
    };
    fetchBlog();
  }, [id]);

  // Handle submitting a new comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addCommentToBlogPost(id, { content: comment });
      setComments([...comments, response.data]);
      setComment(''); // Clear the comment input
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  if (!blogPost) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      {blogPost ? (
        <>
          <h1 className="mb-4">{blogPost.title}</h1>
          <p>{blogPost.content}</p>
  
          <div className="mt-5">
            <h2>Comments</h2>
            {blogPost.comments.map((comment) => (
              <div key={comment._id} className="card mb-3">
                <div className="card-body">
                  <p><strong>{comment.user?.email || 'Anonymous'}:</strong> {comment.content}</p>
                </div>
              </div>
            ))}
  
            <form onSubmit={handleCommentSubmit} className="mt-4">
              <textarea
                className="form-control mb-3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment"
                rows="3"
              ></textarea>
              <button type="submit" className="btn btn-primary">Post Comment</button>
            </form>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
  
};

export default BlogPost;