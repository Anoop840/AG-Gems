'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI, Cart } from '@/lib/api';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

interface CartContextType {
  cart: Cart | null;
  cartItemCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      if (response.success && response.cart) {
        setCart(response.cart);
      }
    } catch (error) {
      // Silently fail if not authenticated
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const response = await cartAPI.addToCart(productId, quantity);
      if (response.success) {
        setCart(response.cart);
        toast({
          title: 'Added to cart',
          description: 'Product added to your cart successfully!',
        });
        // Dispatch custom event to update navbar
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to add item to cart';
      
      if (errorMessage.includes('401') || errorMessage.includes('Not authorized')) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to add items to cart',
          variant: 'destructive',
        });
      } else if (errorMessage.includes('Product not found')) {
        toast({
          title: 'Product not found',
          description: 'The product you are trying to add is not available',
          variant: 'destructive',
        });
      } else if (errorMessage.includes('Insufficient stock')) {
        toast({
          title: 'Insufficient stock',
          description: 'Not enough stock available for this product',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const response = await cartAPI.updateQuantity(itemId, quantity);
      if (response.success) {
        setCart(response.cart);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update quantity',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const response = await cartAPI.removeFromCart(itemId);
      if (response.success) {
        setCart(response.cart);
        toast({
          title: 'Removed',
          description: 'Item removed from cart',
        });
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove item',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItemCount,
        loading,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

