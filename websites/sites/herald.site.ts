import {Story} from "../../types.ts";
import {Site} from "../site-handler.ts";
import {getCurrentBrowser, gotoWithRetry} from "../../handlers/browser.ts";

export const site: Site = {
    name: "NZ Herald",
    id: "herald",
    image: "/img/herald.png",
    rank: 2,
    check: async function(): Promise<Story[]> {
        try {
            const bundle = await getCurrentBrowser();

            await gotoWithRetry(bundle, "https://www.nzherald.co.nz/", {
                attempts: 10,
                timeout: 3_000,
            });

            await bundle.page.waitForFunction(() => {
                const articles = document.querySelectorAll('section[data-test-ui="top-hero-section"] article');

                if (articles.length < 10) return false;

                for (const article of articles) {
                    const titleEl = article.querySelector('[data-test-ui="story-card--headline"]');
                    if (!titleEl) return false;

                    const title = titleEl.textContent?.trim();
                    if (!title) return false;
                }

                return true;
            }, { timeout: 10_000 });

            return await bundle.page.evaluate(() => {
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
        } catch (e) {
            console.log(e)
            return [];
        }
    }
}