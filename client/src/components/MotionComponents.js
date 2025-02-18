import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { IconButton, Button, Card, Container } from '@mui/material';

// Motion variants for different animations
export const fadeInUp = {
    initial: {
        y: 60,
        opacity: 0
    },
    animate: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: [0.6, -0.05, 0.01, 0.99]
        }
    }
};

export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

// Motion components
export const MotionIconButton = motion(IconButton);
export const MotionButton = motion(Button);
export const MotionCard = motion(Card);
export const MotionContainer = motion(Container);

// Animation presets
export const buttonHoverTap = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
};

export const cardHover = {
    whileHover: {
        y: -5,
        transition: {
            duration: 0.2
        }
    }
};

export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delayChildren: 0.3,
            staggerChildren: 0.2
        }
    }
};

export const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1
    }
};
