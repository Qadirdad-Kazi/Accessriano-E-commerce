import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Fetch cart when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart({ items: [], total: 0 });
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      if (response.data.success) {
        setCart(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to fetch cart items');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.warning('Please login to add items to cart');
      return false;
    }

    try {
      const response = await api.post('/cart', { productId, quantity });
      if (response.data.success) {
        setCart(response.data.data);
        toast.success('Added to cart');
        return true;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
    return false;
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return false;

    try {
      const response = await api.delete(`/cart/${productId}`);
      if (response.data.success) {
        setCart(response.data.data);
        toast.success('Removed from cart');
        return true;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error(error.response?.data?.message || 'Failed to remove from cart');
    }
    return false;
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated || quantity < 1) return false;

    try {
      const response = await api.put(`/cart/${productId}`, { quantity });
      if (response.data.success) {
        setCart(response.data.data);
        return true;
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    }
    return false;
  };

  const clearCart = async () => {
    if (!isAuthenticated) return false;

    try {
      const response = await api.delete('/cart');
      if (response.data.success) {
        setCart({ items: [], total: 0 });
        toast.success('Cart cleared');
        return true;
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
    return false;
  };

  const value = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart: fetchCart,
    itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
