import Place from "../models/Place.js";
import {
  generateSummaryWithRAG,
  extractTagsFromSummary,
  extractQueryDetailsFromText,
} from "../services/vibeGenerator.js";
import { scrapeGoogleMaps } from "../services/scraper.js";

// export const scrapeAndSave = async (req, res) => {
//   try {
//     const { query } = req.query;

//     if (!query) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }
//     const extracted = await extractQueryDetailsFromText(query);

//     if (!extracted)
//       return res.status(500).json({ error: "Failed to parse query" });

//     const { city, category, tags } = extracted;

//     // Step 1: Scrape reviews
//     const reviews = await scrapeGoogleMaps(query);

//     // Step 2: Generate summary from reviews
//     const summary = await generateSummaryWithRAG(reviews);

//     // Step 4: Save to MongoDB
//     const place = new Place({
//       name=query,
//       city,
//       category,
//       reviews,
//       summary,
//       tags,
//     });

//     await place.save();

//     res.json({ message: "✅ Place saved with summary and tags!", place });
//   } catch (error) {
//     console.error("Scrape Error:", error.message);
//     res.status(500).json({ error: "❌ Failed to scrape and save reviews." });
//   }
// };

// A basic tag extractor (improve with OpenAI or Gemini later)
// const extractTagsFromSummary = (summary) => {
//   const lower = summary.toLowerCase();
//   const tags = [];

//   if (lower.includes("cozy")) tags.push("cozy");
//   if (lower.includes("aesthetic")) tags.push("aesthetic");
//   if (lower.includes("lively")) tags.push("lively");
//   if (lower.includes("quiet")) tags.push("quiet");
//   if (lower.includes("peaceful")) tags.push("peaceful");
//   if (lower.includes("budget")) tags.push("budget-friendly");
//   if (lower.includes("floral")) tags.push("floral");
//   if (lower.includes("minimal")) tags.push("minimal");

//   return tags;
// };
export const getPlaces = async (req, res) => {
  try {
    const places = await Place.find();
    res.json({ results: places });
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).json({ message: "Failed to fetch places" });
  }
};

export const scrapeAndSave = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Missing query" });

    // Step 1: Extract city/category/tags using Gemini
    const extracted = await extractQueryDetailsFromText(query);
    if (!extracted)
      return res.status(500).json({ error: "Failed to parse query" });

    console.log(extracted);

    console.log("first step done");

    const { city, category, tags, placeName } = extracted;
    console.log(
      "City, category, tags, placeName →",
      city,
      category,
      tags,
      placeName
    );

    const safePlaceName = placeName?.trim() || null;
    const tagText = tags?.length ? tags.join(" ") : "";

    const searchText = safePlaceName
      ? `${tagText} ${safePlaceName} ${city}`.trim()
      : `${tagText} ${category} in ${city}`.trim();

    console.log("🔍 Final searchText →", searchText);

    // Step 2: Search Google Maps and scrape top places
    const scrapedPlaces = await scrapeGoogleMaps(searchText);
    console.log("scraped places is ", scrapedPlaces);

    const savedPlaces = [];

    for (const place of scrapedPlaces) {
      const { name, reviews, image } = place;
      console.log("Name is", name);
      console.log("Reviews is", reviews);

      // Step 3: Generate vibe summary
      const summary = await generateSummaryWithRAG(reviews);

      // Step 4: Auto-tag (from summary or extracted tags)
      const combinedTags = [
        ...new Set([
          ...tags,
          ...((await extractTagsFromSummary(summary).catch((err) => {
            console.error("Tag extraction failed:", err.message);
            return [];
          })) || []),
        ]),
      ];

      // Step 5: Save to MongoDB
      const saved = new Place({
        name,
        city,
        category,
        reviews,
        summary,
        tags: combinedTags,
        image,
      });

      await saved.save();
      savedPlaces.push(saved);
    }

    res.json({
      message: "✅ Places saved!",
      count: savedPlaces.length,
      results: savedPlaces,
    });
  } catch (err) {
    console.error("Scrape Error:", err.message);
    res.status(500).json({ error: "❌ Failed to scrape and save places." });
  }
};
