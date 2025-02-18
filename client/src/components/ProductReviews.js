import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Rating } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

const ProductReviews = () => {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [title, setTitle] = useState('');
  const [rating, setRating] = useState(0);

  // Function to fetch reviews for the product
  const fetchReviews = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/products/${id}/reviews`);
      setReviews(res.data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [id]); // Ensures fetchReviews is stable in memory

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Function to handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      
      await axios.post(
        `http://localhost:5000/api/reviews`,
        { 
          review: newReview, 
          rating, 
          productId: id,
          title 
        },
        config
      );

      toast.success('Review submitted successfully!');
      setNewReview('');
      setTitle('');
      setRating(0);
      fetchReviews(); // Refresh reviews after submission
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Product Reviews
      </Typography>
      {reviews.length > 0 ? (
        <List>
          {reviews.map((review) => (
            <ListItem 
              key={review._id} 
              alignItems="flex-start"
              sx={{ 
                borderBottom: '1px solid #eee',
                '&:last-child': { borderBottom: 'none' }
              }}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle1" component="span" fontWeight="bold">
                      {review.title}
                    </Typography>
                    <Typography variant="body2" component="span" color="text.secondary">
                      - {review.userName || 'Anonymous'}
                    </Typography>
                    <Box sx={{ ml: 'auto' }}>
                      <Rating value={review.rating} readOnly size="small" />
                    </Box>
                  </Box>
                }
                secondary={
                  <Box mt={1}>
                    <Typography variant="body1" color="text.primary">
                      {review.review}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" mt={1}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography color="text.secondary" sx={{ mt: 2 }}>No reviews yet. Be the first to review this product!</Typography>
      )}

      {/* Review Submission Form */}
      <Box component="form" onSubmit={handleReviewSubmit} sx={{ mt: 3 }}>
        <Typography variant="h6">Leave a Review</Typography>
        <TextField
          label="Review Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          label="Your Review"
          fullWidth
          multiline
          rows={3}
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          label="Rating (1-5)"
          type="number"
          inputProps={{ min: 1, max: 5 }}
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value, 10))}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" color="primary">
          Submit Review
        </Button>
      </Box>
    </Box>
  );
};

export default ProductReviews;
