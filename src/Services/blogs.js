// src/services/blogs.js

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Fetch all blogs
export const getBlogPosts = async () => {
  try {
    const response = await axios.get(`${API_URL}/blogs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
};

// Fetch a single blog by ID
export const getBlogPost = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog:', error);
    throw error;
  }
};

// Create a new blog post
export const createBlogPost = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/blogs`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
};
