import axios from 'axios';


const API_URL = `${process.env.REACT_APP_API_URL}/api`; 


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

export const getUserBlogPosts = async (userId) => {
  try {
    const response = await axios.get(`/api/blogs/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user blogs:', error);
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
  getUserBlogPosts,
};
