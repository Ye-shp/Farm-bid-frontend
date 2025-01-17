import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import { format } from 'date-fns';

const Reviews = ({ userId }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, content: '' });
  const [averageRating, setAverageRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!userId) return;
    fetchReviews();
  }, [userId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/reviews/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
    } catch (err) {
      setError('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to submit a review');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/reviews/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: newReview.rating,
          content: newReview.content
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit review');
      }

      const savedReview = await response.json();
      setReviews(prevReviews => [savedReview, ...prevReviews]);
      setNewReview({ rating: 0, content: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoggedIn = !!localStorage.getItem('token');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h6">Reviews</Typography>
        <Rating 
          value={averageRating} 
          precision={0.5} 
          readOnly 
        />
        <Typography variant="body2" color="text.secondary">
          ({reviews.length} reviews)
        </Typography>
      </Stack>

      {/* Add Review Form */}
      {isLoggedIn ? (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Write a Review</Typography>
            <Rating
              value={newReview.rating}
              onChange={(event, newValue) => setNewReview(prevReview => ({ ...prevReview, rating: newValue }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              value={newReview.content}
              onChange={(e) => setNewReview(prevReview => ({ ...prevReview, content: e.target.value }))}
              placeholder="Share your experience..."
              sx={{ mb: 2 }}
            />
            <Button 
              variant="contained" 
              onClick={handleSubmitReview}
              disabled={!newReview.content.trim() || newReview.rating === 0 || isSubmitting}
            >
              Submit Review
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              Please log in to write a review
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <Stack spacing={2}>
          {reviews.map((review) => (
            <Card key={review._id}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar src={review.reviewer?.profileImage} />
                  <Box>
                    <Typography variant="subtitle2">
                      {review.reviewer?.username || 'Unknown User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                </Stack>
                <Rating value={review.rating} readOnly sx={{ mb: 1 }} />
                <Typography variant="body2">{review.content}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          No reviews yet. Be the first to write a review!
        </Typography>
      )}
    </Box>
  );
};

export default Reviews;
