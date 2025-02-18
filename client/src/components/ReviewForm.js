import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Box,
  Typography,
} from '@mui/material';
import { Star } from '@mui/icons-material';

function ReviewForm({ open, onClose, onSubmit, initialRating = 0, productName }) {
  const [rating, setRating] = useState(initialRating);
  const [review, setReview] = useState('');
  const [error, setError] = useState('');
  const reviewInputRef = useRef(null);

  const validateForm = () => {
    if (!rating) {
      setError('Please provide a rating');
      return false;
    }
    if (review.length < 10) {
      setError('Review must be at least 10 characters long');
      reviewInputRef.current?.focus();
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    setError('');
    if (validateForm()) {
      onSubmit({ rating, review });
      setRating(0);
      setReview('');
    }
  };

  const handleClose = () => {
    setError('');
    setRating(initialRating);
    setReview('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="review-dialog-title"
      keepMounted
    >
      <DialogTitle id="review-dialog-title">
        Write a Review {productName && `for ${productName}`}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, mt: 1 }}>
          <Typography component="legend" id="rating-label">Rating</Typography>
          <Rating
            name="product-rating"
            value={rating}
            onChange={(_, newValue) => {
              setRating(newValue);
              setError('');
            }}
            precision={1}
            size="large"
            aria-labelledby="rating-label"
            emptyIcon={<Star style={{ opacity: 0.55 }} fontSize="inherit" />}
          />
        </Box>
        <TextField
          inputRef={reviewInputRef}
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          label="Your Review"
          value={review}
          onChange={(e) => {
            setReview(e.target.value);
            setError('');
          }}
          error={!!error}
          helperText={error || 'Minimum 10 characters'}
          aria-label="Review text"
          inputProps={{
            'aria-describedby': 'review-helper-text'
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          aria-label="Submit review"
        >
          Submit Review
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReviewForm;
