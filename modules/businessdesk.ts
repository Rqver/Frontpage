import * as cheerio from 'npm:cheerio';
import { Story } from "../types.ts";

const extractStory = (element: cheerio.Cheerio<any>): Story | null => {
    const headlineTag = element.find(".card-title a").first();

    if (headlineTag.length === 0) {
        return null;
    }

    const title = headlineTag.text().trim();
    const url = headlineTag.attr("href") || "";

    return {
        title: title,
        isBreaking: false,
        link: url,
    }
};

export async function getTopBusinessDeskStories(): Promise<Story[]> {
    const res = await fetch("https://businessdesk.co.nz/");
    const text = await res.text();

    const $ = cheerio.load(text);
    const stories: Story[] = [];

    const articleElements = $(".card.news-card");

    for (const articleElement of articleElements){
        const element = $(articleElement);

        if (element.hasClass('sponsored') || element.find('a[href*="/sponsored"]').length > 0) {
            continue;
        }

        const story = extractStory(element);
        if (story) {
            stories.push(story);
        }
    }

    return stories;
}