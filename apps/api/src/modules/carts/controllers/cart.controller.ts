import { Request, Response } from 'express';
import Cart from '../models/cart.model';

// Get user's cart
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      // Create empty cart if it doesn't exist
      try {
        cart = new Cart({ userId, items: [] });
        await cart.save();
      } catch (saveError: any) {
        console.error('Error creating empty cart:', saveError);
        
        // Handle duplicate key error specifically
        if (saveError.code === 11000) {
          // Try to find the cart again in case it was created by another request
          cart = await Cart.findOne({ userId });
          if (!cart) {
            // Return empty cart structure if still not found
            return res.json({ userId, items: [], createdAt: new Date(), updatedAt: new Date() });
          }
        } else {
          // Return empty cart structure for other errors
          return res.json({ userId, items: [], createdAt: new Date(), updatedAt: new Date() });
        }
      }
    }

    // Ensure items array exists and is valid
    if (!cart.items || !Array.isArray(cart.items)) {
      cart.items = [];
    }

    res.json(cart);
  } catch (error) {
    console.error('Error getting cart:', error);
    // Return empty cart structure on error instead of 500
    res.json({ 
      userId: req.user?._id, 
      items: [], 
      createdAt: new Date(), 
      updatedAt: new Date() 
    });
  }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId, quantity = 1, price, name, image, location, category } = req.body;

    console.log('Add to cart request:', { userId, productId, quantity, price, name, image, location, category });

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!productId || !price || !name) {
      console.log('Validation failed:', { productId, price, name });
      return res.status(400).json({ error: 'Product ID, price, and name are required' });
    }

    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      try {
        cart = new Cart({ userId, items: [] });
      } catch (error: any) {
        // Handle duplicate key error - try to find existing cart
        if (error.code === 11000) {
          cart = await Cart.findOne({ userId });
          if (!cart) {
            return res.status(500).json({ error: 'Unable to create or find cart' });
          }
        } else {
          throw error;
        }
      }
    }

    // Check if item already exists in cart
    // Ensure both productId and item.productId are strings for comparison
    const existingItemIndex = cart.items.findIndex(item => String(item.productId) === String(productId));
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      const newQuantity = (cart.items[existingItemIndex].quantity || 0) + (Number(quantity) || 1);
      cart.items[existingItemIndex].quantity = newQuantity;
      console.log('Updated existing item quantity:', { productId, newQuantity });
    } else {
      // Add new item
      const newItem = {
        productId: String(productId), // Ensure productId is always a string
        quantity: Number(quantity) || 1,
        price: Number(price) || 0,
        name: String(name || '').trim(),
        image: String(image || ''),
        location: String(location || ''),
        category: String(category || '')
      };
      
      console.log('Adding new item to cart:', newItem);
      cart.items.push(newItem);
    }

    await cart.save();
    console.log('Cart saved successfully:', cart);
    res.json(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: req.user?._id,
      productId: req.body?.productId
    });
    res.status(500).json({ error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Update item quantity in cart
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => String(item.productId) === String(productId));
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => String(item.productId) !== String(productId));
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Clear entire cart
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get cart count (total number of items)
export const getCartCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.json({ count: 0 });
    }

    const count = cart.items.reduce((total, item) => total + item.quantity, 0);
    res.json({ count });
  } catch (error) {
    console.error('Error getting cart count:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
