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
    <div className="container mt-4">
      {blogPost ? (
        <>
          <div className="blog-post-container mb-4">
            <h1 className="blog-post-title">{blogPost.title}</h1>
            <p className="blog-post-content">{blogPost.content}</p>
          </div>

          <div className="comments-section">
            <h2 className="comments-title">Responses</h2>
            <div className="comments-grid">
              {blogPost.comments.map((comment) => (
                <div key={comment._id} className="comment-card">
                  <div className="comment-card-body">
                    <p className="comment-user">
                      {comment.user?.email || 'Anonymous'}
                    </p>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleCommentSubmit} className="comment-form mt-4">
              <textarea
                className="form-control"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a response..."
                rows="3"
              ></textarea>
              <button type="submit" className="btn btn-primary mt-2">
                Submit Response
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="loading-spinner d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPost;