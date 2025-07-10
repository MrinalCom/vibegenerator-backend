import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  text: String,
  rating: String,
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
  image: String,
});

export default mongoose.model("Place", placeSchema);
