# 🌍 Vibe Navigator — Your AI-Powered City Explorer 🚶‍♀️☕🌿

Vibe Navigator is a modern web application that scrapes real user reviews from platforms like Google Maps to understand the **"vibe"** of public places such as cafes, parks, and gyms in any city.

With Generative AI + RAG (Retrieval-Augmented Generation), it acts like your personal AI concierge — giving you **story-based recommendations** grounded in actual reviews.

---

## ✨ Features

- 🔍 **Search by city & category** — e.g., "Cafes in Delhi", "Parks in Bangalore"
- 🧠 **LLM-powered vibe summaries** using real reviews
- 🎴 **Vibe Cards** with emojis, tags, and friendly descriptions
- 🤖 **AI Concierge** (coming soon) that chats like a local friend
- 📌 **Review citations** for trust and transparency
- 🔧 Scalable backend using **Node.js + MongoDB**
- 💡 Clean architecture & modular code structure

---

## 🧠 How it Works

### Backend Flow (Node.js + OpenAI):

1. Scrape real reviews from Google Maps using Puppeteer
2. Store place and review data in MongoDB
3. Use GPT-4 to generate vibe summaries (with RAG)
4. Return results via REST APIs (`/api/vibes`, `/summary`, etc.)
