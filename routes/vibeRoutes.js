import express from "express";
// import {
//   getVibesByCity,
//   generateVibeSummary,
//   handlePersonalizedQuery,
// } from "../controllers/vibeController.js";
import { scrapeAndSave, getPlaces } from "../controllers/vibeController.js";

const router = express.Router();
router.get(
  "/scrape",
  (req, res, next) => {
    console.log("Hitting route");
    next();
  },
  scrapeAndSave
);
router.get("/getall", getPlaces);
// router.get("/summary", generateVibeSummary);

// router.get("/", getVibesByCity); // ?city=Delhi&category=cafe
// router.get("/summary", generateVibeSummary);
// router.get("/personalize", handlePersonalizedQuery);

export default router;
