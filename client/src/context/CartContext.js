import React, { createContext, useReducer, useContext } from 'react';

// Initial state for the cart
const initialState = {
  cartItems: [], // Each item: { product, quantity }
};

// Cart reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItemIndex = state.cartItems.findIndex(
        item => item.product._id === action.payload.product._id
      );
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedCartItems = [...state.cartItems];
        updatedCartItems[existingItemIndex].quantity += action.payload.quantity;
        return { ...state, cartItems: updatedCartItems };
      } else {
        // Add new item to cart
        return { ...state, cartItems: [...state.cartItems, action.payload] };
      }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter(
          item => item.product._id !== action.payload
        ),
      };
    case 'UPDATE_QUANTITY':
      const updatedItems = state.cartItems.map(item => {
        if (item.product._id === action.payload.productId) {
          return { ...item, quantity: action.payload.quantity };
        }
        return item;
      });
      return { ...state, cartItems: updatedItems };
    default:
      return state;
  }
};

// Create the context
const CartContext = createContext();

// Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Actions
  const addToCart = (product, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  return (
    <CartContext.Provider value={{ cart: state.cartItems, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook for using cart context
export const useCart = () => useContext(CartContext);
