import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const generateSummaryWithRAG = async (reviews, customPrompt = null) => {
  try {
    const context = reviews.map((r, i) => `${i + 1}. "${r.text}"`).join("\n");

    const prompt = customPrompt
      ? `Use real reviews to suggest a place for: "${customPrompt}"`
      : `
Use the reviews below to describe the vibe of this place in a playful tone.
Include 1-2 direct quotes and tag the vibe (like cozy, aesthetic, peaceful).

Reviews:
${context}

Summary:
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    const summary = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    return summary || "⚠️ No response from Gemini.";
  } catch (err) {
    console.error("❌ Gemini API error:", err.message);
    return "⚠️ Could not generate summary right now. Try again later.";
  }
};

export const extractQueryDetailsFromText = async (query) => {
  try {
    const prompt = `
Extract the city, category (like cafe, park, etc.), and any vibe tags (like romantic, aesthetic, peaceful) from this query.
Return only valid JSON with the structure: 
{
  "city": "...",
  "category": "...",
  "tags": ["...", "..."]
}

Query: "${query}"
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    const rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Parse only if JSON exists
    if (!rawText) return null;

    const match = rawText.match(/\{[\s\S]*?\}/);
    if (!match) return null;

    const extracted = JSON.parse(match[0]);
    return extracted;
  } catch (err) {
    console.error("❌ Gemini extractQueryDetails error:", err.message);
    return null;
  }
};

export const extractTagsFromSummary = async (summary) => {
  try {
    const prompt = `
Extract 3–5 short, lowercase vibe tags from the summary below.
Only return an array of strings. Do not explain.

Summary:
"${summary}"

Tags:
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    const rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Try to extract an array from Gemini's response
    const match = rawText.match(/\[.*?\]/s);
    const tags = match ? JSON.parse(match[0]) : [];

    return Array.isArray(tags) ? tags : [];
  } catch (err) {
    console.error("❌ Gemini tag extraction error:", err.message);
    return [];
  }
};
