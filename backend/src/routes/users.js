import express from 'express';
import passport from 'passport';
import User from '../models/User.js';

const router = express.Router();

// Get user profile
router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching profile' });
    }
  }
);

// Update user profile
router.put(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { skinType, skinConcerns } = req.body;
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { skinType, skinConcerns },
        { new: true }
      );
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error updating profile' });
    }
  }
);

export default router;
