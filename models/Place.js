import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  text: String,
  rating: Number,
  source: String,
  link: String,
});

const placeSchema = new mongoose.Schema({
  name: String,
  city: String,
  category: String,
  reviews: [reviewSchema],
  summary: String,
  tags: [String],
});

export default mongoose.model("Place", placeSchema);
