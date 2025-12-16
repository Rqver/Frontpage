import * as cheerio from 'npm:cheerio';
import { Story } from "../../types.ts";
import {Site} from "../site-handler.ts";

const extractStory = (element: cheerio.Cheerio<any>): Story | null => {
    const headlineTag = element.find("h3, h4.text-single-title").first();
    if (headlineTag.length === 0) {
        return null;
    }

    const title = headlineTag.text().trim();

    let url = headlineTag.closest('a').attr('href');
    if (!url) {
        url = element.find('a').first().attr('href');
    }

    if (!url) return null;

    return {
        title: title,
        isBreaking: false,
        link: url
    }
};

export const site: Site = {
   name: "NBR",
   id: "nbr",
   image: "/img/nbr.png",
   rank: 6,
   check: async function(): Promise<Story[]> {
        const res = await fetch("https://www.nbr.co.nz/");
        const text = await res.text();

        const $ = cheerio.load(text);
        const stories: Story[] = [];

        const topStoryEl = $(".top-story .main-article.d-none.d-xl-block");
        if (topStoryEl.length) {
            const s = extractStory(topStoryEl);
            if (s) stories.push(s);
        }

        $(".latest-news .col-xl-4.d-none.d-xl-block .item").each((_, el) => {
            const s = extractStory($(el));
            if (s) stories.push(s);
        });

        $(".editors-pick .item").each((_, el) => {
            const s = extractStory($(el));
            if (s) stories.push(s);
        });

        const featMain = $(".home-featured .home-featured-main");
        if (featMain.length) {
            const s = extractStory(featMain);
            if (s) stories.push(s);
        }

        $(".home-featured .item.d-none.d-xl-block").each((_, el) => {
            const s = extractStory($(el));
            if (s) stories.push(s);
        });

        return stories;
   }
}