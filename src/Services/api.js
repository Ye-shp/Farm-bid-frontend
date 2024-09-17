import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; 

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to dynamically add the token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');  // Always retrieve the token dynamically
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  // Handle the error
  return Promise.reject(error);
});

// User registration
export const register = (data) => 
  api.post('/auth/register', data)
    .catch(error => {
      console.error("Error in register API:", error);
      throw error;
    });

// User login
export const login = (data) => 
  api.post('/auth/login', data)
    .catch(error => {
      console.error("Error in login API:", error);
      throw error;
    });

// Fetch all products
export const getProducts = () => 
  api.get('/products')
    .catch(error => {
      console.error("Error in fetching products:", error);
      throw error;
    });

// Fetch a single product by ID
export const getProduct = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error in fetching product:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Place a bid on a product
export const placeBid = async (id, data) => {
  try {
    const response = await api.post(`/products/${id}/bids`, data);
    return response.data;
  } catch (error) {
    console.error("Error in placing bid:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Create a new auction
export const createAuction = async (data) => {
  try {
    const response = await api.post('/auctions/create', data);
    return response.data;
  } catch (error) {
    console.error("Error in creating auction:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Create a new product
export const createProduct = async (data) => {
  try {
    const response = await api.post('/products', data);
    return response.data;
  } catch (error) {
    console.error("Error in creating product:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export default api;

// Get all blogs
export const getBlogs = async () => {
  try {
    const response = await api.get('/blogs');
    return response.data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
};

// Get a single blog post by ID
export const getBlogById = async (id) => {
  try {
    const response = await api.get(`/blogs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw error;
  }
};

// Create a new blog post
export const createBlog = async (data) => {
  try {
    const response = await api.post('/blogs', data);
    return response.data;
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
};

// Post a comment on a blog
export const postComment = async (blogId, commentData) => {
  try {
    const response = await api.post(`/blogs/${blogId}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error posting comment:', error);
    throw error;
  }
};
