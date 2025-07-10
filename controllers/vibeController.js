import Place from "../models/Place.js";
import { generateSummaryWithRAG } from "../services/vibeGenerator.js";
import { scrapeGoogleMaps } from "../services/scraper.js";

export const scrapeAndSave = async (req, res) => {
  try {
    const { name, city, category, googleUrl } = req.body;

    if (!name || !city || !category || !googleUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const reviews = await scrapeGoogleMaps(googleUrl);

    const place = new Place({
      name,
      city,
      category,
      tags: [], // Optional
      rating: 4.5,
      reviews,
    });

    await place.save();

    res.json({ message: "✅ Place saved!", place });
  } catch (error) {
    console.error("Scrape Error:", error.message);
    res.status(500).json({ error: "❌ Failed to scrape and save reviews." });
  }
};

export const getVibesByCity = async (req, res) => {
  const { city, category } = req.query;
  const places = await Place.find({ city, category });
  res.json(places);
};

export const generateVibeSummary = async (req, res) => {
  try {
    const { placeId, customPrompt } = req.query;

    if (!placeId) {
      return res.status(400).json({ error: "Missing placeId" });
    }

    const place = await Place.findById(placeId);
    if (!place) return res.status(404).json({ error: "Place not found" });

    const summary = await generateSummaryWithRAG(place.reviews, customPrompt);

    res.json({ summary });
  } catch (err) {
    console.error("generateVibeSummary error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const handlePersonalizedQuery = async (req, res) => {
  const { query } = req.query;
  const result = await generateSummaryWithRAG([], query); // no reviews, use RAG
  res.json({ story: result });
};
