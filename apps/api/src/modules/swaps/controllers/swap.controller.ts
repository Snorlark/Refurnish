import { Request, Response } from 'express';
import Swap from '../models/swap.model';
import Product from '../../products/models/products.model';

export const createSwap = async (req: Request, res: Response) => {
  try {
    const requesterId = req.user?._id;
    const { productId, message } = req.body;

    if (!requesterId) return res.status(401).json({ error: 'User not authenticated' });
    if (!productId) return res.status(400).json({ error: 'productId is required' });

    const product = await Product.findById(productId).populate('owner', '_id');
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const sellerId = (product.owner as any)?._id;
    if (!sellerId) return res.status(400).json({ error: 'Product has no owner' });

    const swap = await Swap.create({ requesterId, sellerId, productId: String(productId), message: message || '' });

    return res.status(201).json({ success: true, swap });
  } catch (error) {
    console.error('Error creating swap:', error);
    return res.status(500).json({ error: 'Server error creating swap' });
  }
};

export const getMySwaps = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: 'User not authenticated' });

    const swaps = await Swap.find({ requesterId: userId }).sort({ createdAt: -1 });

    // attach basic product info (title, first image)
    const productIds = Array.from(new Set(swaps.map(s => s.productId)));
    const products = await Product.find({ _id: { $in: productIds } }).select('_id title images');
    const productIdToInfo = new Map(products.map(p => [p._id.toString(), { id: p._id.toString(), title: p.title, image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '' }]));

    const enriched = swaps.map(s => ({
      ...s.toObject(),
      product: productIdToInfo.get(s.productId) || null,
    }));

    return res.json(enriched);
  } catch (error) {
    console.error('Error fetching swaps:', error);
    return res.status(500).json({ error: 'Server error fetching swaps' });
  }
};

export const getSwapsForSeller = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: 'User not authenticated' });

    const swaps = await Swap.find({ sellerId: userId }).sort({ createdAt: -1 });

    const productIds = Array.from(new Set(swaps.map(s => s.productId)));
    const products = await Product.find({ _id: { $in: productIds } }).select('_id title images');
    const productIdToInfo = new Map(products.map(p => [p._id.toString(), { id: p._id.toString(), title: p.title, image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '' }]));

    const enriched = swaps.map(s => ({
      ...s.toObject(),
      product: productIdToInfo.get(s.productId) || null,
    }));

    return res.json(enriched);
  } catch (error) {
    console.error('Error fetching seller swaps:', error);
    return res.status(500).json({ error: 'Server error fetching seller swaps' });
  }
};

export const deleteSwapAsSeller = async (req: Request, res: Response) => {
  try {
    const sellerId = req.user?._id;
    const { swapId } = req.params;

    if (!sellerId) return res.status(401).json({ error: 'User not authenticated' });
    if (!swapId) return res.status(400).json({ error: 'swapId is required' });

    const swap = await Swap.findById(swapId);
    if (!swap) return res.status(404).json({ error: 'Swap not found' });
    if (String(swap.sellerId) !== String(sellerId)) {
      return res.status(403).json({ error: 'Not authorized to delete this swap' });
    }

    await Swap.findByIdAndDelete(swapId);
    return res.json({ success: true, message: 'Swap deleted' });
  } catch (error) {
    console.error('Error deleting swap:', error);
    return res.status(500).json({ error: 'Server error deleting swap' });
  }
};


