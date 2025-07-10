import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";

puppeteer.use(StealthPlugin());

export const scrapeGoogleMaps = async (searchQuery) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
    searchQuery
  )}`;
  console.log("🌐 Navigating to:", mapsUrl);
  await page.goto(mapsUrl, { waitUntil: "networkidle2", timeout: 60000 });

  // Wait for results to load
  await page.waitForSelector(".Nv2PK");

  // Scroll sidebar
  await page.evaluate(async () => {
    const container = document.querySelector(".m6QErb[aria-label]");
    for (let i = 0; i < 6; i++) {
      container.scrollBy(0, 1000);
      await new Promise((r) => setTimeout(r, 1500));
    }
  });

  // Extract top 5 cards
  const places = await page.$$eval(".Nv2PK", (cards) =>
    cards.slice(0, 5).map((el) => ({
      name: el.querySelector(".qBF1Pd")?.innerText,
      rating: Number(el.querySelector(".MW4etd")?.innerText) || 0,
      totalReviews:
        Number(el.querySelector(".UY7F9")?.innerText.replace(/[^\d]/g, "")) ||
        0,

      address: el.querySelector(".W4Efsd > span:nth-child(1)")?.innerText,
      link: el.querySelector("a.hfpxzc")?.href,
    }))
  );

  for (let place of places) {
    try {
      await page.goto(place.link, { waitUntil: "networkidle2" });
      await page.waitForSelector('div[aria-label*="star"]', { timeout: 10000 });

      // Scroll review panel
      await page.evaluate(async () => {
        const revPane = document.querySelector(".WNBkOb");
        if (revPane) {
          for (let i = 0; i < 4; i++) {
            revPane.scrollBy(0, 1000);
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
      });

      // Extract reviews
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

      // Extract phone number and image
      const details = await page.evaluate(() => {
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
      place.phone = details.phone;
      place.image = details.image;

      console.log(`✅ Scraped: ${place.name}`);
    } catch (e) {
      console.warn(`⚠️ Failed for ${place.name}: ${e.message}`);
      place.reviews = [];
      place.phone = "N/A";
      place.image = null;
    }
  }

  // Save to file
  // fs.writeFileSync("places.json", JSON.stringify(places, null, 2));
  console.log(`📁 Saved ${places.length} places to places.json`);
  return places;

  await browser.close();
};
