import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: 'default-avatar.png',
  },
  skinType: {
    type: String,
    enum: ['dry', 'oily', 'combination', 'normal', 'sensitive'],
    default: 'normal',
  },
  skinConcerns: [{
    type: String,
    enum: ['acne', 'aging', 'pigmentation', 'sensitivity', 'dryness', 'oiliness'],
  }],
  followingProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  /** Map of productId -> rating given by this user */
  ratings: {
    type: Map,
    of: Number,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('User', userSchema);
