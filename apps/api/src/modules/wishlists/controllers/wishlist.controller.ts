import { Request, Response } from 'express';
import Wishlist from '../models/wishlist.model';

// Get user's wishlist
export const getWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      // Create empty wishlist if it doesn't exist
      wishlist = new Wishlist({ userId, items: [] });
      await wishlist.save();
    }

    res.json(wishlist);
  } catch (error) {
    console.error('Error getting wishlist:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add item to wishlist
export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId, name, price, image, location, category } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!productId || !name || !price) {
      return res.status(400).json({ error: 'Product ID, name, and price are required' });
    }

    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    // Check if item already exists in wishlist
    const existingItemIndex = wishlist.items.findIndex(item => String(item.productId) === String(productId));
    
    if (existingItemIndex > -1) {
      // Item already exists, return existing wishlist
      return res.json(wishlist);
    }

    // Add new item
    wishlist.items.push({
      productId: String(productId),
      name,
      price,
      image,
      location,
      category
    });

    await wishlist.save();
    res.json(wishlist);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    wishlist.items = wishlist.items.filter(item => String(item.productId) !== String(productId));
    await wishlist.save();
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Clear entire wishlist
export const clearWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    wishlist.items = [];
    await wishlist.save();
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get wishlist count (total number of items)
export const getWishlistCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      return res.json({ count: 0 });
    }

    const count = wishlist.items.length;
    res.json({ count });
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Check if item is in wishlist
export const checkWishlistItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      return res.json({ isInWishlist: false });
    }

    const isInWishlist = wishlist.items.some(item => String(item.productId) === String(productId));
    res.json({ isInWishlist });
  } catch (error) {
    console.error('Error checking wishlist item:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
