import React, { useState } from 'react';
import {
    Box,
    IconButton,
    Dialog,
    DialogContent,
    useTheme,
    useMediaQuery,
    ImageList,
    ImageListItem,
} from '@mui/material';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Close as CloseIcon,
} from '@mui/icons-material';

const ImageGallery = ({ images, alt }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [selectedImage, setSelectedImage] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const handlePrevious = (e) => {
        e.stopPropagation();
        setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const handleThumbnailClick = (index) => {
        setSelectedImage(index);
    };

    const toggleLightbox = () => {
        setLightboxOpen(!lightboxOpen);
    };

    return (
        <Box>
            {/* Main Image */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: isMobile ? '300px' : '500px',
                    mb: 2,
                    cursor: 'zoom-in',
                }}
                onClick={toggleLightbox}
            >
                <img
                    src={images[selectedImage]}
                    alt={`${alt} - ${selectedImage + 1}`}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                    }}
                />
                {images.length > 1 && (
                    <>
                        <IconButton
                            sx={{
                                position: 'absolute',
                                left: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'background.paper',
                                '&:hover': { bgcolor: 'background.paper' },
                            }}
                            onClick={handlePrevious}
                        >
                            <ChevronLeftIcon />
                        </IconButton>
                        <IconButton
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'background.paper',
                                '&:hover': { bgcolor: 'background.paper' },
                            }}
                            onClick={handleNext}
                        >
                            <ChevronRightIcon />
                        </IconButton>
                    </>
                )}
            </Box>

            {/* Thumbnails */}
            {images.length > 1 && (
                <ImageList
                    sx={{
                        width: '100%',
                        height: 100,
                        display: 'flex',
                        overflowX: 'auto',
                        '&::-webkit-scrollbar': {
                            height: 6,
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: 'background.paper',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'primary.main',
                            borderRadius: 3,
                        },
                    }}
                    cols={images.length}
                    rowHeight={100}
                >
                    {images.map((image, index) => (
                        <ImageListItem
                            key={index}
                            sx={{
                                cursor: 'pointer',
                                opacity: selectedImage === index ? 1 : 0.5,
                                transition: 'opacity 0.2s',
                                '&:hover': { opacity: 1 },
                            }}
                            onClick={() => handleThumbnailClick(index)}
                        >
                            <img
                                src={image}
                                alt={`${alt} thumbnail ${index + 1}`}
                                style={{
                                    width: '100px',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            )}

            {/* Lightbox */}
            <Dialog
                open={lightboxOpen}
                onClose={toggleLightbox}
                maxWidth="xl"
                fullScreen={isMobile}
            >
                <DialogContent
                    sx={{
                        p: 0,
                        position: 'relative',
                        bgcolor: 'background.paper',
                    }}
                >
                    <IconButton
                        onClick={toggleLightbox}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            zIndex: 1,
                            bgcolor: 'background.paper',
                            '&:hover': { bgcolor: 'background.paper' },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Box
                        sx={{
                            width: '100%',
                            height: isMobile ? '100vh' : '80vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <img
                            src={images[selectedImage]}
                            alt={`${alt} - ${selectedImage + 1}`}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                            }}
                        />
                        {images.length > 1 && (
                            <>
                                <IconButton
                                    onClick={handlePrevious}
                                    sx={{
                                        position: 'absolute',
                                        left: 8,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        bgcolor: 'background.paper',
                                        '&:hover': { bgcolor: 'background.paper' },
                                    }}
                                >
                                    <ChevronLeftIcon />
                                </IconButton>
                                <IconButton
                                    onClick={handleNext}
                                    sx={{
                                        position: 'absolute',
                                        right: 8,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        bgcolor: 'background.paper',
                                        '&:hover': { bgcolor: 'background.paper' },
                                    }}
                                >
                                    <ChevronRightIcon />
                                </IconButton>
                            </>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default ImageGallery;
