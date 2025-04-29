import express from 'express';
import passport from 'passport';
import multer from 'multer';
import { uploadFile } from '../config/pronto.js';
import Post from '../models/Post.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Create a post and associate with products
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  upload.single('image'),
  async (req, res) => {
    try {
      // Upload image to Pronto
      const uploadResult = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      console.log('Pronto upload result:', uploadResult);

      // Extract file metadata from different possible shapes
      const fileInfo = uploadResult.file ?? uploadResult.data ?? uploadResult;
      const imageUrl = fileInfo.secureUrl || fileInfo.rawUrl || fileInfo.url;
      if (!imageUrl) {
        console.error('Missing image URL in uploadResult', fileInfo);
        throw new Error('No file URL returned from Pronto');
      }

      // Parse and link products
      const prodInputs = JSON.parse(req.body.products);
      const prodIds = [];
      for (const p of prodInputs) {
        let prod = await Product.findOne({ name: p.name, brand: p.brand });
        if (!prod) prod = await Product.create({ name: p.name, brand: p.brand, posts: [] });
        prodIds.push(prod._id);
      }
      // Create post
      const post = await Post.create({
        user: req.user._id,
        image: imageUrl,
        description: req.body.description,
        products: prodIds,
        skinConcerns: JSON.parse(req.body.skinConcerns),
      });
      // Update products with post reference
      await Promise.all(
        prodIds.map(async (pid) => {
          await Product.findByIdAndUpdate(pid, { $push: { posts: post._id } });
        })
      );

      await post.populate('user', 'name avatar');
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ message: 'Error creating post', error: error.message });
    }
  }
);

// Get feed posts: followed or searched products
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { productTag, page = 1, limit = 10 } = req.query;
      // Get user following list
      const user = req.user; // contains followingProducts
      let query = {};
      if (productTag) {
        // Search by product name
        const prods = await Product.find({ name: { $regex: productTag, $options: 'i' } }).select('_id');
        const ids = prods.map((p) => p._id);
        query.products = { $in: ids };
      } else {
        // Default: feed of followed products
        query.products = { $in: user.followingProducts || [] };
      }
      // Fetch posts
      const posts = await Post.find(query)
        .populate('user', 'name avatar skinType')
        .populate('products', 'name brand')
        .populate('reviews.user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      const total = await Post.countDocuments(query);
      res.json({ posts, totalPages: Math.ceil(total / limit), currentPage: page });
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
  }
);

// Like/unlike a post
router.post(
  '/:id/like',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const likeIndex = post.likes.indexOf(req.user._id);
      
      if (likeIndex === -1) {
        post.likes.push(req.user._id);
      } else {
        post.likes.splice(likeIndex, 1);
      }

      await post.save();
      res.json(post);
    } catch (error) {
      console.error('Error updating like:', error);
      res.status(500).json({ message: 'Error updating like', error: error.message });
    }
  }
);

// Add comment to a post
router.post(
  '/:id/comment',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      post.comments.push({
        user: req.user._id,
        text: req.body.text,
      });

      await post.save();
      await post.populate('comments.user', 'name avatar');
      
      res.json(post);
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
  }
);

// Add or update a review (1-10 stars)
router.post(
  '/:id/review',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { rating } = req.body;
    if (typeof rating !== 'number' || rating < 1 || rating > 10) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 10' });
    }
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      // Remove any existing review by this user
      post.reviews = post.reviews.filter(
        (r) => r.user.toString() !== req.user._id.toString()
      );
      post.reviews.push({ user: req.user._id, rating });
      await post.save();
      await post.populate('reviews.user', 'name avatar');
      res.json(post);
    } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({ message: 'Error adding review', error: error.message });
    }
  }
);

export default router;
