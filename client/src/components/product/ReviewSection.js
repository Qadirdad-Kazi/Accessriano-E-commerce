import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  Button,
  Paper,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  LinearProgress,
} from '@mui/material';
import { formatDistance } from 'date-fns';
import axiosInstance from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const ReviewSection = ({ productId }) => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    }
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/reviews/product/${productId}?page=${page}&limit=5`);
      
      if (response.data.success) {
        const newReviews = response.data.data || [];
        setReviews(prevReviews => 
          page === 1 ? newReviews : [...prevReviews, ...newReviews]
        );
        
        // Update pagination
        const { pagination } = response.data;
        setHasMore(pagination.current < pagination.pages);
        
        // Calculate stats from reviews if it's the first page
        if (page === 1) {
          const totalReviews = pagination.total;
          const averageRating = newReviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews;
          const ratingDistribution = newReviews.reduce((acc, review) => {
            acc[review.rating] = (acc[review.rating] || 0) + 1;
            return acc;
          }, {1: 0, 2: 0, 3: 0, 4: 0, 5: 0});

          setStats({
            averageRating,
            totalReviews,
            ratingDistribution
          });
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, page]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const getRatingPercentage = (rating) => {
    return stats.totalReviews > 0 
      ? (stats.ratingDistribution[rating] / stats.totalReviews) * 100 
      : 0;
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Customer Reviews
      </Typography>

      {/* Reviews Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" gutterBottom>
                {stats.averageRating.toFixed(1)}
              </Typography>
              <Rating value={stats.averageRating} precision={0.5} readOnly size="large" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Based on {stats.totalReviews} reviews
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <Box key={rating} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 20 }}>
                    {rating}★
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={getRatingPercentage(rating)}
                    sx={{ 
                      flex: 1,
                      height: 8,
                      borderRadius: 1
                    }}
                  />
                  <Typography variant="body2" sx={{ minWidth: 40 }}>
                    {stats.ratingDistribution[rating]}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Reviews List */}
      <Box sx={{ mt: 3 }}>
        {reviews.length === 0 && !loading ? (
          <Alert severity="info">No reviews yet. Be the first to review this product!</Alert>
        ) : (
          reviews.map((review, index) => (
            <Paper key={review._id} sx={{ p: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={review.user.avatar} alt={review.user.name}>
                  {review.user.name.charAt(0)}
                </Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle1">{review.user.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDistance(new Date(review.createdAt), new Date(), { addSuffix: true })}
                  </Typography>
                </Box>
              </Box>
              
              <Rating value={review.rating} readOnly sx={{ mb: 1 }} />
              
              {review.title && (
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {review.title}
                </Typography>
              )}
              
              <Typography variant="body1" color="text.secondary" paragraph>
                {review.review}
              </Typography>
              
              {index !== reviews.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Paper>
          ))
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {hasMore && !loading && reviews.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button 
              variant="outlined" 
              onClick={handleLoadMore}
              disabled={loading}
            >
              Load More Reviews
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ReviewSection;
