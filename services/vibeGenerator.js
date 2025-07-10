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
