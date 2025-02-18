import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axios';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Fetch wishlist when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/wishlist');
      if (response.data.success) {
        setWishlist(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.warning('Please login to add items to wishlist');
      return false;
    }

    try {
      const response = await axiosInstance.post(`/wishlist/${productId}`);
      if (response.data.success) {
        await fetchWishlist(); // Refresh the wishlist after adding
        toast.success('Added to wishlist');
        return true;
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error(error.response?.data?.message || 'Failed to add to wishlist');
    }
    return false;
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return false;

    try {
      const response = await axiosInstance.delete(`/wishlist/${productId}`);
      if (response.data.success) {
        await fetchWishlist(); // Refresh the wishlist after removing
        toast.success('Removed from wishlist');
        return true;
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error(error.response?.data?.message || 'Failed to remove from wishlist');
    }
    return false;
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => 
      item.product._id === productId || 
      (typeof item.product === 'string' && item.product === productId)
    );
  };

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist: fetchWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
