import puppeteer from "npm:puppeteer";
import {Story} from "../../types.ts";
import {Site} from "../site-handler.ts";

// I really did not want to have to use a headless browser but NZH's home page is extremely unnecessarily complex
// There's a huge amount of JSON loaded as a part of the HTML which contains some stories with locked positions, but these locked positions are all over the page and aren't necessarily the first X stories, and if they were, X changes
// Then there's this 'Karma' thing that, from my understanding uses my location and a bunch of other information it's tried to track about me to pick the rest of the stories using 'AI', but the order these stories are returned in is also completely random and don't include the X stories that have locked positions
// And obviously this Karma thing happens after the page is loaded, hence the puppeteer, although I did try to recreate the request process it is so strangely complex that A: It gives me the vibe it would change frequently, and B: The amount of time I would have spent trying to
export const site: Site = {
    name: "NZ Herald",
    id: "herald",
    image: "/img/herald.png",
    rank: 2,
    check: async function(): Promise<Story[]> {
        const browser = await puppeteer.launch({
            headless: "new",
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--disable-gpu",
            ],
        });

        try {
            const page = await browser.newPage();

            await page.setRequestInterception(true);
            page.on("request", (req) => {
                const resourceType = req.resourceType();
                if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            await page.goto("https://www.nzherald.co.nz/", {
                waitUntil: "networkidle2",
                timeout: 5000,
            });

            return await page.evaluate(() => {
                const results: Story[] = [];
                const seenLinks = new Set();

                const scrapeCard = (article) => {
                    const titleEl = article.querySelector('[data-test-ui="story-card--headline"]');
                    if (!titleEl) return;

                    const title = titleEl.innerText.trim();

                    const linkEl = article.querySelector('a[data-test-ui="story-card--link--title"]');
                    if (!linkEl) return;

                    let link = linkEl.getAttribute("href");
                    if (link && !link.startsWith("http")) {
                        link = `https://www.nzherald.co.nz${link}`;
                    }

                    if (seenLinks.has(link)) return;
                    seenLinks.add(link);

                    const isBreaking = !!article.querySelector('[data-test-ui="story-card--live-indicator"]');

                    results.push({
                        title,
                        link,
                        isBreaking,
                    });
                };

                const busterSection = document.querySelector('section[data-test-ui="buster-section"]');
                if (busterSection) {
                    const articles = busterSection.querySelectorAll('article');
                    articles.forEach(scrapeCard);
                }

                const topHeroSection = document.querySelector('section[data-test-ui="top-hero-section"]');
                if (topHeroSection) {
                    const articles = topHeroSection.querySelectorAll('article');
                    articles.forEach(scrapeCard);
                }

                return results;
            });
        } catch (_) {
            return [];
        } finally {
            await browser.close();
        }
    }
}