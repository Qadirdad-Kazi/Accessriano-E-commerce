import React, { createContext, useReducer, useContext, useEffect } from 'react';

// Get initial state from localStorage or use default
const getInitialState = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? { cartItems: JSON.parse(savedCart) } : { cartItems: [] };
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return { cartItems: [] };
  }
};

// Cart reducer function
const cartReducer = (state, action) => {
  let newState;
  
  try {
    switch (action.type) {
      case 'ADD_TO_CART':
        const existingItemIndex = state.cartItems.findIndex(
          item => item.product._id === action.payload.product._id
        );
        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          const updatedCartItems = [...state.cartItems];
          updatedCartItems[existingItemIndex].quantity += action.payload.quantity;
          newState = { ...state, cartItems: updatedCartItems };
        } else {
          // Add new item to cart
          newState = { ...state, cartItems: [...state.cartItems, action.payload] };
        }
        break;

      case 'REMOVE_FROM_CART':
        newState = {
          ...state,
          cartItems: state.cartItems.filter(
            item => item.product._id !== action.payload
          ),
        };
        break;

      case 'UPDATE_QUANTITY':
        const updatedItems = state.cartItems.map(item => {
          if (item.product._id === action.payload.productId) {
            return { ...item, quantity: Math.max(1, action.payload.quantity) };
          }
          return item;
        });
        newState = { ...state, cartItems: updatedItems };
        break;

      case 'CLEAR_CART':
        newState = {
          ...state,
          cartItems: []
        };
        break;

      case 'SET_CART':
        newState = { ...state, cartItems: action.payload };
        break;

      default:
        return state;
    }

    // Save to localStorage after each change
    localStorage.setItem('cart', JSON.stringify(newState.cartItems));
    return newState;
  } catch (error) {
    console.error('Error in cart reducer:', error);
    return state;
  }
};

// Create the context
const CartContext = createContext();

// Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, getInitialState());

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'SET_CART', payload: parsedCart });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }, []);

  // Actions
  const addToCart = (product, quantity = 1) => {
    if (!product || !product._id) {
      console.error('Invalid product:', product);
      return;
    }
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
  };

  const removeFromCart = (productId) => {
    if (!productId) {
      console.error('Invalid productId:', productId);
      return;
    }
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    if (!productId || quantity < 1) {
      console.error('Invalid update parameters:', { productId, quantity });
      return;
    }
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    try {
      return state.cartItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);
    } catch (error) {
      console.error('Error calculating cart total:', error);
      return 0;
    }
  };

  const getCartItemCount = () => {
    try {
      return state.cartItems.reduce((count, item) => count + item.quantity, 0);
    } catch (error) {
      console.error('Error calculating cart count:', error);
      return 0;
    }
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart: state.cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        cartCount: getCartItemCount(),
        cartTotal: getCartTotal()
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook for using cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
