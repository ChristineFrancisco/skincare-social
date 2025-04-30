import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
});

export default mongoose.model('Product', productSchema);
