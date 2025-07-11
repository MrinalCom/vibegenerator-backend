import { chromium } from "playwright";
import fs from "fs";

export const scrapeGoogleMaps = async (searchQuery) => {
  const browser = await chromium.launch({
    headless: true,
  });
  const page = await browser.newPage();

  // Set a User-Agent using correct Playwright method
  await page.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
    searchQuery
  )}`;
  console.log("🌐 Navigating to:", mapsUrl);

  // Load with domcontentloaded for Google Maps stability
  await page.goto(mapsUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

  // Wait for place cards to load
  await page.waitForSelector(".Nv2PK", { timeout: 15000 });

  // Scroll to load more results
  await page.evaluate(async () => {
    const container = document.querySelector(".m6QErb[aria-label]");
    for (let i = 0; i < 6; i++) {
      container.scrollBy(0, 1000);
      await new Promise((r) => setTimeout(r, 1500));
    }
  });

  // Extract basic info of top 5 places
  const places = await page.$$eval(".Nv2PK", (cards) =>
    cards.slice(0, 5).map((el) => ({
      name: el.querySelector(".qBF1Pd")?.innerText || "",
      rating: Number(el.querySelector(".MW4etd")?.innerText) || 0,
      totalReviews:
        Number(el.querySelector(".UY7F9")?.innerText.replace(/[^\d]/g, "")) ||
        0,
      address: el.querySelector(".W4Efsd > span:nth-child(1)")?.innerText || "",
      link: el.querySelector("a.hfpxzc")?.href || "",
    }))
  );

  for (let place of places) {
    try {
      await page.goto(place.link, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await page.waitForTimeout(2000);

      // Scroll the reviews section
      await page.evaluate(async () => {
        const revPane = document.querySelector(".WNBkOb");
        if (revPane) {
          for (let i = 0; i < 4; i++) {
            revPane.scrollBy(0, 1000);
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
      });

      // Extract up to 3 reviews
      const reviews = await page.$$eval(".jftiEf", (nodes) =>
        nodes.slice(0, 3).map((n) => ({
          author: n.querySelector(".d4r55")?.innerText || "Anonymous",
          rating:
            n.querySelector(".kvMYJc")?.getAttribute("aria-label") ||
            "No rating",
          text: n.querySelector(".wiI7pd")?.innerText || "",
          date: n.querySelector(".rsqaWe")?.innerText || "",
        }))
      );

      // Get phone number & image (if available)
      const { phone, image } = await page.evaluate(() => {
        const phone =
          Array.from(document.querySelectorAll(".UsdlK")).find((el) =>
            el.innerText.match(/^\+?\d[\d ()\-]+$/)
          )?.innerText || "N/A";

        const image =
          document.querySelector(".aoRNLd img")?.src ||
          document.querySelector(".uc8wNb img")?.src ||
          null;

        return { phone, image };
      });

      place.reviews = reviews;
      place.phone = phone;
      place.image = image;

      console.log(`✅ Scraped: ${place.name}`);
    } catch (err) {
      console.warn(`⚠️ Failed for ${place.name}: ${err.message}`);
      place.reviews = [];
      place.phone = "N/A";
      place.image = null;
    }
  }

  await browser.close();
  console.log(`📁 Scraped ${places.length} places.`);

  console.log("📄 Data saved to places.json");

  return places;
};
