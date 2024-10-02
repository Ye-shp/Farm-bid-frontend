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
    <div>
      {blogPost ? (
        <>
          <h1>{blogPost.title}</h1>
          <p>{blogPost.content}</p>

          <div>
            <h2>Comments</h2>
            {blogPost.comments.map((comment) => (
              <div key={comment._id}>
                <p><strong>{comment.user?.email || 'Anonymous'}:</strong> {comment.content}</p>
              </div>
            ))}

            <form onSubmit={handleCommentSubmit}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment"
              ></textarea>
              <button type="submit">Post Comment</button>
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