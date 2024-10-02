import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Adjust this as needed for your API

// Fetch all blog posts
export const getBlogPosts = () => axios.get(`${API_URL}/blogs`);

// Fetch a single blog post by ID (with comments)
export const getBlogPost = (id) => axios.get(`${API_URL}/blogs/${id}`);

// Create a new blog post
export const createBlogPost = (data) => axios.post(`${API_URL}/blogs/create`, data);

// Add a comment to a blog post
export const addCommentToBlogPost = (blogId, commentData) => {
  return axios.post(`${API_URL}/blogs/${blogId}/comment`, commentData);
};

// Export all the functions
export default {
  getBlogPosts,
  getBlogPost,
  createBlogPost,
  addCommentToBlogPost,
};
