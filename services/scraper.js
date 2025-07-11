// import puppeteer from "puppeteer-extra";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";
// import fs from "fs";
// import { executablePath } from "puppeteer";

// puppeteer.use(StealthPlugin());

// export const scrapeGoogleMaps = async (searchQuery) => {
//   const browser = await puppeteer.launch({
//     headless: true,
//     executablePath: executablePath(),
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   });
//   const page = await browser.newPage();

//   await page.setUserAgent(
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//   );

//   const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
//     searchQuery
//   )}`;
//   console.log("🌐 Navigating to:", mapsUrl);
//   await page.goto(mapsUrl, { waitUntil: "networkidle2", timeout: 60000 });

//   // Wait for results to load
//   await page.waitForSelector(".Nv2PK");

//   // Scroll sidebar
//   await page.evaluate(async () => {
//     const container = document.querySelector(".m6QErb[aria-label]");
//     for (let i = 0; i < 6; i++) {
//       container.scrollBy(0, 1000);
//       await new Promise((r) => setTimeout(r, 1500));
//     }
//   });

//   // Extract top 5 cards
//   const places = await page.$$eval(".Nv2PK", (cards) =>
//     cards.slice(0, 5).map((el) => ({
//       name: el.querySelector(".qBF1Pd")?.innerText,
//       rating: Number(el.querySelector(".MW4etd")?.innerText) || 0,
//       totalReviews:
//         Number(el.querySelector(".UY7F9")?.innerText.replace(/[^\d]/g, "")) ||
//         0,

//       address: el.querySelector(".W4Efsd > span:nth-child(1)")?.innerText,
//       link: el.querySelector("a.hfpxzc")?.href,
//     }))
//   );

//   for (let place of places) {
//     try {
//       await page.goto(place.link, { waitUntil: "networkidle2" });
//       await page.waitForSelector('div[aria-label*="star"]', { timeout: 10000 });

//       // Scroll review panel
//       await page.evaluate(async () => {
//         const revPane = document.querySelector(".WNBkOb");
//         if (revPane) {
//           for (let i = 0; i < 4; i++) {
//             revPane.scrollBy(0, 1000);
//             await new Promise((r) => setTimeout(r, 1000));
//           }
//         }
//       });

//       // Extract reviews
//       const reviews = await page.$$eval(".jftiEf", (nodes) =>
//         nodes.slice(0, 3).map((n) => ({
//           author: n.querySelector(".d4r55")?.innerText || "Anonymous",
//           rating:
//             n.querySelector(".kvMYJc")?.getAttribute("aria-label") ||
//             "No rating",
//           text: n.querySelector(".wiI7pd")?.innerText || "",
//           date: n.querySelector(".rsqaWe")?.innerText || "",
//         }))
//       );

//       // Extract phone number and image
//       const details = await page.evaluate(() => {
//         const phone =
//           Array.from(document.querySelectorAll(".UsdlK")).find((el) =>
//             el.innerText.match(/^\+?\d[\d ()\-]+$/)
//           )?.innerText || "N/A";

//         const image =
//           document.querySelector(".aoRNLd img")?.src ||
//           document.querySelector(".uc8wNb img")?.src ||
//           null;

//         return { phone, image };
//       });

//       place.reviews = reviews;
//       place.phone = details.phone;
//       place.image = details.image;

//       console.log(`✅ Scraped: ${place.name}`);
//     } catch (e) {
//       console.warn(`⚠️ Failed for ${place.name}: ${e.message}`);
//       place.reviews = [];
//       place.phone = "N/A";
//       place.image = null;
//     }
//   }

//   // Save to file
//   // fs.writeFileSync("places.json", JSON.stringify(places, null, 2));
//   console.log(`📁 Saved ${places.length} places to places.json`);
//   return places;

//   await browser.close();
// };

// import puppeteer from "puppeteer-extra";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";
// import chromium from "chrome-aws-lambda";

// puppeteer.use(StealthPlugin());

// export const scrapeGoogleMaps = async (searchQuery) => {
//   const browser = await puppeteer.launch({
//     args: chromium.args,
//     defaultViewport: chromium.defaultViewport,
//     executablePath: await chromium.executablePath,

//     headless: chromium.headless,
//   });

//   const page = await browser.newPage();

//   await page.setUserAgent(
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//   );

//   const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
//     searchQuery
//   )}`;
//   console.log("🌐 Navigating to:", mapsUrl);
//   await page.goto(mapsUrl, { waitUntil: "networkidle2", timeout: 60000 });

//   await page.waitForSelector(".Nv2PK");

//   await page.evaluate(async () => {
//     const container = document.querySelector(".m6QErb[aria-label]");
//     for (let i = 0; i < 6; i++) {
//       container.scrollBy(0, 1000);
//       await new Promise((r) => setTimeout(r, 1500));
//     }
//   });

//   const places = await page.$$eval(".Nv2PK", (cards) =>
//     cards.slice(0, 5).map((el) => ({
//       name: el.querySelector(".qBF1Pd")?.innerText,
//       rating: Number(el.querySelector(".MW4etd")?.innerText) || 0,
//       totalReviews:
//         Number(el.querySelector(".UY7F9")?.innerText.replace(/[^\d]/g, "")) ||
//         0,
//       address: el.querySelector(".W4Efsd > span:nth-child(1)")?.innerText,
//       link: el.querySelector("a.hfpxzc")?.href,
//     }))
//   );

//   for (let place of places) {
//     try {
//       await page.goto(place.link, { waitUntil: "networkidle2" });
//       await page.waitForSelector('div[aria-label*="star"]', { timeout: 10000 });

//       await page.evaluate(async () => {
//         const revPane = document.querySelector(".WNBkOb");
//         if (revPane) {
//           for (let i = 0; i < 4; i++) {
//             revPane.scrollBy(0, 1000);
//             await new Promise((r) => setTimeout(r, 1000));
//           }
//         }
//       });

//       const reviews = await page.$$eval(".jftiEf", (nodes) =>
//         nodes.slice(0, 3).map((n) => ({
//           author: n.querySelector(".d4r55")?.innerText || "Anonymous",
//           rating:
//             n.querySelector(".kvMYJc")?.getAttribute("aria-label") ||
//             "No rating",
//           text: n.querySelector(".wiI7pd")?.innerText || "",
//           date: n.querySelector(".rsqaWe")?.innerText || "",
//         }))
//       );

//       const details = await page.evaluate(() => {
//         const phone =
//           Array.from(document.querySelectorAll(".UsdlK")).find((el) =>
//             el.innerText.match(/^\+?\d[\d ()\-]+$/)
//           )?.innerText || "N/A";

//         const image =
//           document.querySelector(".aoRNLd img")?.src ||
//           document.querySelector(".uc8wNb img")?.src ||
//           null;

//         return { phone, image };
//       });

//       place.reviews = reviews;
//       place.phone = details.phone;
//       place.image = details.image;

//       console.log(`✅ Scraped: ${place.name}`);
//     } catch (e) {
//       console.warn(`⚠️ Failed for ${place.name}: ${e.message}`);
//       place.reviews = [];
//       place.phone = "N/A";
//       place.image = null;
//     }
//   }

//   await browser.close();

//   console.log(`📁 Scraped ${places.length} places.`);
//   return places;
// };

import { chromium } from "playwright";
import fs from "fs";

export const scrapeGoogleMaps = async (searchQuery) => {
  const browser = await chromium.launch({
    headless: true,
    channel: "chrome", // force full Chrome, not headless_shell
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
