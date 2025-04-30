import express from 'express';
import passport from 'passport';
import Product from '../models/Product.js';
import User from '../models/User.js';

const router = express.Router();

// Create or get a product
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { name, brand } = req.body;
    try {
      let product = await Product.findOne({ name, brand });
      if (!product) {
        product = await Product.create({ name, brand, posts: [] });
      }
      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error creating product' });
    }
  }
);

// Get all products
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching products' });
    }
  }
);

// Get product with associated posts
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).populate({
        path: 'posts',
        populate: { path: 'user', select: 'name avatar' },
      });
      if (!product) return res.status(404).json({ message: 'Product not found' });
      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching product' });
    }
  }
);

// Follow a product
router.post(
  '/:id/follow',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (user.followingProducts.includes(req.params.id)) {
        return res.status(400).json({ message: 'Already following' });
      }
      user.followingProducts.push(req.params.id);
      await user.save();
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error following product' });
    }
  }
);

// Unfollow a product
router.delete(
  '/:id/follow',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      user.followingProducts = user.followingProducts.filter(
        (pid) => pid.toString() !== req.params.id
      );
      await user.save();
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error unfollowing product' });
    }
  }
);

// Rate a product
router.post(
  '/:id/rate',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const productId = req.params.id;
    const { rating } = req.body;
    if (typeof rating !== 'number' || rating < 1 || rating > 10) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 10' });
    }
    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      // Update user rating map
      const user = await User.findById(req.user._id);
      const oldRating = user.ratings.get(productId) ?? null;
      user.ratings.set(productId, rating);
      await user.save();

      // Update product averageRating and ratingCount
      let newCount;
      let newAvg;
      if (oldRating !== null) {
        newCount = product.ratingCount;
        newAvg = (product.averageRating * newCount + (rating - oldRating)) / newCount;
      } else {
        newCount = product.ratingCount + 1;
        newAvg = (product.averageRating * product.ratingCount + rating) / newCount;
      }
      product.averageRating = newAvg;
      product.ratingCount = newCount;
      await product.save();

      res.json({ productId, averageRating: newAvg, ratingCount: newCount });
    } catch (err) {
      console.error('Error rating product:', err);
      res.status(500).json({ message: 'Error rating product', error: err.message });
    }
  }
);

export default router;
