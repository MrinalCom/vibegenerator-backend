import puppeteer from "puppeteer";

export const scrapeGoogleMaps = async (placeUrl) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto(placeUrl, { waitUntil: "networkidle2", timeout: 60000 });

  // Wait for reviews to load
  await page.waitForSelector(".fontBodyMedium", { timeout: 10000 });

  // Extract review texts
  const reviews = await page.$$eval(".fontBodyMedium", (els) =>
    els.map((el) => el.innerText).filter(Boolean)
  );

  await browser.close();

  // Format reviews
  return reviews.slice(0, 5).map((text) => ({
    text,
    rating: 5, // Placeholder rating
    source: "Google Maps",
    link: placeUrl,
  }));
};
