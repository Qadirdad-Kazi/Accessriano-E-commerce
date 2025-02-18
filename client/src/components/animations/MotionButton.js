import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@mui/material';

const MotionButton = ({ children, whileHover, whileTap, ...props }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{ display: 'inline-block' }}
    >
      <Button {...props}>
        {children}
      </Button>
    </motion.div>
  );
};

export default MotionButton;
