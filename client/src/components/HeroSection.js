// client/src/components/HeroSection.js
import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.1&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
    title: 'Summer Collection 2024',
    subtitle: 'Discover the latest trends in fashion',
    buttonText: 'Shop Now',
    link: '/category/summer'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.1&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
    title: 'Accessories Collection',
    subtitle: 'Complete your look with our accessories',
    buttonText: 'Explore',
    link: '/category/accessories'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?ixlib=rb-4.0.1&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
    title: 'New Arrivals',
    subtitle: 'Be the first to get our latest products',
    buttonText: 'View Collection',
    link: '/new-arrivals'
  }
];

const HeroSlide = styled(motion.div)(({ theme }) => ({
  position: 'relative',
  height: '70vh',
  width: '100%',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  alignItems: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  }
}));

const HeroContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  color: 'white',
  textAlign: 'center',
  padding: theme.spacing(3),
}));

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <HeroSlide
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            backgroundImage: `url(${slides[currentSlide].image})`
          }}
        >
          <Container maxWidth="lg">
            <HeroContent>
              <Typography
                variant="h2"
                component={motion.h2}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                sx={{ 
                  mb: 2,
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {slides[currentSlide].title}
              </Typography>
              <Typography
                variant="h5"
                component={motion.h5}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                sx={{ 
                  mb: 4,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                {slides[currentSlide].subtitle}
              </Typography>
              <Button
                component={motion.button}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                variant="contained"
                size="large"
                href={slides[currentSlide].link}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  backgroundColor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white'
                  }
                }}
              >
                {slides[currentSlide].buttonText}
              </Button>
            </HeroContent>
          </Container>
        </HeroSlide>
      </AnimatePresence>
      
      {/* Slide indicators */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          zIndex: 2
        }}
      >
        {slides.map((_, index) => (
          <Box
            key={index}
            component={motion.div}
            animate={{
              scale: currentSlide === index ? 1.2 : 1,
              opacity: currentSlide === index ? 1 : 0.5
            }}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default HeroSection;