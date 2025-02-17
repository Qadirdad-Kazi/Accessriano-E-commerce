import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Rating,
    Typography,
    Paper,
    IconButton,
    Stack,
    Alert,
    CircularProgress
} from '@mui/material';
import { PhotoCamera, Close } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config';

const ReviewForm = ({ productId, orderId, onReviewSubmitted, onClose }) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate inputs
            if (!rating || rating < 1 || rating > 5) {
                throw new Error('Please select a rating between 1 and 5 stars');
            }

            if (!review.trim()) {
                throw new Error('Please write a review');
            }

            if (!orderId || orderId.length !== 24) {
                throw new Error('Invalid order ID');
            }

            if (!productId || productId.length !== 24) {
                throw new Error('Invalid product ID');
            }

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('You must be logged in to submit a review');
            }

            console.log('Submitting review:', {
                productId,
                orderId,
                rating,
                review
            });

            const response = await axios.post(
                `${API_BASE_URL}/products/${productId}/reviews`,
                {
                    rating,
                    review,
                    orderId
                },
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                toast.success('Review submitted successfully!');
                if (onReviewSubmitted) {
                    onReviewSubmitted(response.data.data);
                }
                if (onClose) {
                    onClose();
                }
            } else {
                throw new Error(response.data.message || 'Failed to submit review');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Review submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <Alert severity="info">
                Please log in to write a review
            </Alert>
        );
    }

    if (!orderId || !productId) {
        return (
            <Alert severity="error">
                Invalid order or product information. Cannot submit review.
            </Alert>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" gutterBottom>
                    Write a Review
                </Typography>
                
                <Stack spacing={2}>
                    <Box>
                        <Typography component="legend">Rating</Typography>
                        <Rating
                            name="rating"
                            value={rating}
                            onChange={(event, newValue) => {
                                setRating(newValue);
                            }}
                            precision={1}
                            size="large"
                        />
                    </Box>

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        label="Your Review"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        disabled={loading}
                        error={error && !review}
                        helperText={error && !review ? "Review is required" : ""}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        sx={{ mt: 2 }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Submit Review'
                        )}
                    </Button>
                </Stack>
            </Box>
        </Paper>
    );
};

export default ReviewForm;
