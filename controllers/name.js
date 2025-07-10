import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
puppeteer.use(StealthPlugin());

async function scrape(query) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(
    `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
    { waitUntil: "networkidle2" }
  );
  await page.waitForSelector(".Nv2PK"); // card containers

  // infinite scroll list
  await page.evaluate(async () => {
    const container = document.querySelector(".m6QErb[aria-label]");
    for (let i = 0; i < 5; i++) {
      container.scrollBy(0, 1000);
      await new Promise((r) => setTimeout(r, 2000));
    }
  });

  // extract list data
  const places = await page.$$eval(".Nv2PK", (els) =>
    els.slice(0, 5).map((el) => ({
      name: el.querySelector(".qBF1Pd")?.innerText,
      rating: el.querySelector(".MW4etd")?.innerText,
      reviews: el.querySelector(".UY7F9")?.innerText,
      address: el.querySelector(".W4Efsd > span:nth-child(1)")?.innerText,
      link: el.querySelector("a.hfpxzc")?.href,
    }))
  );

  for (let place of places) {
    await page.goto(place.link, { waitUntil: "networkidle2" });
    await page.waitForSelector('div[aria-label*="star"]');

    // scroll review panel
    await page.evaluate(async () => {
      const revPane = document.querySelector(".WNBkOb");
      for (let i = 0; i < 5; i++) {
        revPane.scrollBy(0, 1000);
        await new Promise((r) => setTimeout(r, 1500));
      }
    });

    const reviews = await page.$$eval(".jftiEf", (nodes) =>
      nodes.map((n) => ({
        author: n.querySelector(".d4r55")?.innerText,
        rating: n.querySelector(".kvMYJc")?.getAttribute("aria-label"),
        text: n.querySelector(".wiI7pd")?.innerText,
        date: n.querySelector(".rsqaWe")?.innerText,
      }))
    );

    place.reviews = reviews.slice(0, 3);
  }

  console.log(places);
  await browser.close();
}

scrape("cafe in Delhi");
