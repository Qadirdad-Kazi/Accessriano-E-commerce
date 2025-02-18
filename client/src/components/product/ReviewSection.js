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
} from '@mui/material';
import api from '../../utils/api';
import { formatDistance } from 'date-fns';

const ReviewSection = ({ productId }) => {
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
      const response = await api.get(
        `/products/${productId}/reviews?page=${page}`
      );
      
      if (response.data.success) {
        const newReviews = response.data.data || [];
        setReviews(prevReviews => 
          page === 1 ? newReviews : [...prevReviews, ...newReviews]
        );
        setHasMore(response.data.pagination?.hasNextPage || false);
        
        // Update stats if it's the first page
        if (page === 1 && response.data.stats) {
          setStats(response.data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
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
              <Rating value={stats.averageRating} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary">
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
                  <Box
                    sx={{
                      flexGrow: 1,
                      height: 8,
                      bgcolor: 'grey.200',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        width: `${(stats.ratingDistribution[rating] / stats.totalReviews) * 100 || 0}%`,
                        height: '100%',
                        bgcolor: 'primary.main'
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                    {stats.ratingDistribution[rating] || 0}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Reviews List */}
      <Box sx={{ mt: 3 }}>
        {loading && page === 1 ? (
          <CircularProgress />
        ) : (
          <>
            {Array.isArray(reviews) && reviews.length > 0 ? (
              <>
                {reviews.map((review, index) => (
                  <Paper key={review._id || index} sx={{ p: 3, mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {review.user?.name?.[0] || 'U'}
                        </Avatar>
                      </Grid>
                      <Grid item xs>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" component="div" fontWeight="medium">
                            {review.user?.name || 'Anonymous'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            • {review.createdAt && formatDistance(new Date(review.createdAt), new Date(), { addSuffix: true })}
                          </Typography>
                        </Box>
                        <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />
                        {review.title && (
                          <Typography variant="subtitle2" sx={{ mb: 1 }} fontWeight="medium">
                            {review.title}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          {review.content}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                {hasMore && (
                  <Box display="flex" justifyContent="center" mt={2}>
                    <Button
                      onClick={handleLoadMore}
                      disabled={loading}
                      variant="outlined"
                    >
                      {loading ? 'Loading...' : 'Load More Reviews'}
                    </Button>
                  </Box>
                )}
              </>
            ) : (
              <Typography color="text.secondary" align="center">
                No reviews yet for this product.
              </Typography>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default ReviewSection;
