import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Box
} from '@mui/material';
import { Star } from '@mui/icons-material';

function ReviewForm({ open, onClose, onSubmit, initialRating = 0, productName }) {
  const [rating, setRating] = useState(initialRating);
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    onSubmit({ rating, review });
    setRating(0);
    setReview('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Write a Review {productName && `for ${productName}`}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, mt: 1 }}>
          <Rating
            name="product-rating"
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
            precision={0.5}
            icon={<Star fontSize="inherit" />}
          />
        </Box>
        <TextField
          margin="dense"
          label="Your Review"
          fullWidth
          multiline
          rows={4}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          disabled={!rating || !review.trim()}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReviewForm;
