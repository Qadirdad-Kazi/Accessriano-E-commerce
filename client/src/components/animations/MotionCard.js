import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@mui/material';

const MotionCard = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.43, 0.13, 0.23, 0.96]
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card sx={{ height: '100%' }}>
        {children}
      </Card>
    </motion.div>
  );
};

export default MotionCard;
