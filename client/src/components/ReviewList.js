import React, { useState } from 'react';
import {
    Box,
    Typography,
    Rating,
    Avatar,
    Button,
    Divider,
    Stack,
    Chip,
    IconButton,
    Dialog,
    DialogContent,
    Pagination,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import {
    ThumbUp,
    ThumbUpOutlined,
    Flag,
    Image as ImageIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ReviewList = ({ reviews, totalReviews, page, onPageChange, onSortChange }) => {
    const { user } = useAuth();
    const [selectedImages, setSelectedImages] = useState(null);
    const [loadingStates, setLoadingStates] = useState({});

    const handleHelpful = async (reviewId) => {
        if (!user) {
            toast.info('Please log in to vote');
            return;
        }

        setLoadingStates(prev => ({ ...prev, [reviewId]: true }));

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `/api/reviews/${reviewId}/helpful`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            // Update the review in parent component
            onSortChange(); // Refresh reviews
        } catch (error) {
            toast.error('Failed to update helpful votes');
        } finally {
            setLoadingStates(prev => ({ ...prev, [reviewId]: false }));
        }
    };

    const handleReport = async (reviewId) => {
        if (!user) {
            toast.info('Please log in to report');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `/api/reviews/${reviewId}/report`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('Review reported successfully');
        } catch (error) {
            toast.error('Failed to report review');
        }
    };

    const handleImageClick = (images) => {
        setSelectedImages(images);
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                    Customer Reviews ({totalReviews})
                </Typography>
                
                <FormControl size="small" sx={{ width: 200 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                        label="Sort By"
                        onChange={(e) => onSortChange(e.target.value)}
                        defaultValue="newest"
                    >
                        <MenuItem value="newest">Newest First</MenuItem>
                        <MenuItem value="highest">Highest Rated</MenuItem>
                        <MenuItem value="lowest">Lowest Rated</MenuItem>
                        <MenuItem value="helpful">Most Helpful</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Stack spacing={3}>
                {reviews.map((review) => (
                    <Box key={review._id}>
                        <Box sx={{ display: 'flex', mb: 2 }}>
                            <Avatar
                                src={review.user.avatar}
                                alt={review.user.name}
                                sx={{ width: 40, height: 40, mr: 2 }}
                            />
                            <Box>
                                <Typography variant="subtitle1">
                                    {review.user.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {format(new Date(review.createdAt), 'MMM d, yyyy')}
                                </Typography>
                            </Box>
                        </Box>

                        <Rating value={review.rating} readOnly precision={1} />
                        
                        <Typography variant="h6" sx={{ mt: 1 }}>
                            {review.title}
                        </Typography>
                        
                        <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
                            {review.review}
                        </Typography>

                        {review.images?.length > 0 && (
                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                {review.images.map((image, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            cursor: 'pointer',
                                            position: 'relative',
                                            '&:hover': {
                                                opacity: 0.8,
                                            },
                                        }}
                                        onClick={() => handleImageClick(review.images)}
                                    >
                                        <img
                                            src={image}
                                            alt={`Review ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: 4,
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        )}

                        {review.verified && (
                            <Chip
                                label="Verified Purchase"
                                color="success"
                                size="small"
                                sx={{ mb: 2 }}
                            />
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button
                                size="small"
                                startIcon={
                                    review.helpfulVotes.includes(user?._id) 
                                        ? <ThumbUp /> 
                                        : <ThumbUpOutlined />
                                }
                                onClick={() => handleHelpful(review._id)}
                                disabled={loadingStates[review._id]}
                            >
                                Helpful ({review.helpfulVotes.length})
                            </Button>

                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleReport(review._id)}
                            >
                                <Flag />
                            </IconButton>
                        </Box>

                        <Divider sx={{ mt: 2 }} />
                    </Box>
                ))}
            </Stack>

            {totalReviews > 0 && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        count={Math.ceil(totalReviews / 10)}
                        page={page}
                        onChange={(_, value) => onPageChange(value)}
                        color="primary"
                    />
                </Box>
            )}

            <Dialog
                open={!!selectedImages}
                onClose={() => setSelectedImages(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogContent>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: 2,
                        }}
                    >
                        {selectedImages?.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Review ${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: 4,
                                }}
                            />
                        ))}
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default ReviewList;
