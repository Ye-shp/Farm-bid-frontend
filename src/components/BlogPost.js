import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBlogPost, addCommentToBlogPost, likeBlogPost} from '../Services/blogs';

const BlogPost = () => {
  const { id } = useParams();
  const [blogPost, setBlogPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [likes , setLikes] = useState('0');
  const [hasLiked, setHasLiked] = useState(false);


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
    const token = localStorage.getItem('token');
    try {
      const response = await addCommentToBlogPost(id, { content: comment }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setComments([...comments, response.data]);
      setComment(''); // Clear the comment input
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleLike = async () => {
    const token = localStorage.getItem('token');
    try {
      const updatedBlog = await likeBlogPost(id, token);
      setLikes(updatedBlog.likes.length);
      const userId = localStorage.getItem('userId');
      setHasLiked(updatedBlog.likes.includes(userId));
    } catch (err) {
      console.error('Error liking the blog post:', err);
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
            {/* Blog Title */}
            <h1 className="blog-post-title">{blogPost.title}</h1>
  
            {/* Blog Author and Created Date */}
            <p className="blog-post-author">
              By {blogPost.user?.username || 'Anonymous'} on {new Date(blogPost.createdAt).toLocaleDateString()}
            </p>
  
            {/* Blog Content */}
            <p className="blog-post-content">{blogPost.content}</p>
  
            {/* Blog Metrics - Views and Likes */}
            <div className="blog-metrics mb-3">
              <span className="views-count">
                <i className="fa fa-eye"></i> {blogPost.views} views
              </span>
              <span className="likes-count ms-3">
                <button onClick={handleLike} className="btn btn-outline-primary btn-sm">
                  {hasLiked ? 'Unlike' : 'Like'} ({likes})
                </button>
              </span>
            </div>
          </div>
  
          {/* Comments Section */}
          <div className="comments-section">
            <h2 className="comments-title">Responses ({comments.length})</h2>
            <div className="comments-grid">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="comment-card">
                    <div className="comment-card-body">
                      <p className="comment-user">
                        {comment.user?.username || 'Anonymous'} -{' '}
                        <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </p>
                      <p className="comment-content">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No comments yet. Be the first to respond!</p>
              )}
            </div>
  
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="comment-form mt-4">
              <textarea
                className="form-control"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a response..."
                rows="3"
                required
              ></textarea>
              <button type="submit" className="btn btn-primary mt-2">
                Submit Response
              </button>
            </form>
          </div>
        </>
      ) : (
        // Loading Spinner
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