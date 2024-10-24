import axios from 'axios';

const API_URL = 'https://farm-bid-3998c30f5108.herokuapp.com/api'; 

const getToken = () => localStorage.getItem('token');

// Fetch all blog posts
export const getBlogPosts = () => axios.get(`${API_URL}/blogs`);

// Fetch a single blog post by ID (with comments)
export const getBlogPost = (id) => axios.get(`${API_URL}/blogs/${id}`);

// Create a new blog post
export const createBlogPost = (data) =>
  axios.post(`${API_URL}/blogs/create`, data, {
    headers: {
      Authorization: `Bearer ${getToken()}`, // Attach token for authenticated requests
    },
  });

// Add a comment to a blog post
export const addCommentToBlogPost = (blogId, commentData) =>
  axios.post(`${API_URL}/blogs/${blogId}/comment`, commentData, {
    headers: {
      Authorization: `Bearer ${getToken()}`, // Attach token for authenticated requests
    },
  });

  export const likeBlogPost = async (blogId, token) => {
    try {
      const response = await axios.post(
        `${API_URL}/blogs/${blogId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error liking the blog post:', error);
      throw error;
    }
  };

// Export all the functions
export default {
  getBlogPosts,
  getBlogPost,
  createBlogPost,
  addCommentToBlogPost,
  likeBlogPost,
};
