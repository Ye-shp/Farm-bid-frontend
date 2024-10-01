import axios from 'axios';

const API_URL = 'http://localhost:5000/api/blogs'; // Adjust if needed

// Fetch all blog posts
export const getBlogPosts = () => axios.get(API_URL);

// Fetch a single blog post by ID
export const getBlogPost = (id) => axios.get(`${API_URL}/${id}`);

// Create a new blog post
export const createBlogPost = (data) => axios.post(`${API_URL}/create`, data);

// Add a comment to a blog post
export const addComment = (id, data) => axios.post(`${API_URL}/${id}/comment`, data);
