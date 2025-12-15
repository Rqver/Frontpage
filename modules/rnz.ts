import * as cheerio from 'npm:cheerio';
import { Story } from "../types.ts";

const extractStory = (element: cheerio.Cheerio<any>): Story => {
    const headlineTag = element.find(".o-digest__headline a").first();
    const title = headlineTag.text().trim();
    const url = `https://rnz.co.nz${headlineTag.attr("href")}`

    return {
        title: title,
        isBreaking: false, // RNZ Don't really have a 'breaking' thing? Could match to the story their breaking bar is currently linking to I guess?
        link: url
    }
};

export async function getTopRNZStories(): Promise<Story[]> {
    const res = await fetch("https://rnz.co.nz/");
    const text = await res.text();

    const $ = cheerio.load(text);
    const stories: Story[] = [];

    const leadStoryEl = $(".c-top-stories__primary .lead-story").first();
    if (leadStoryEl.length) {
        stories.push(extractStory(leadStoryEl));
    }

    $(".c-top-stories__primary .c-top-stories__list > li").each((_, el) => {
        stories.push(extractStory($(el)));
    });

    $(".c-top-stories__secondary .c-top-stories__secondary-list > li").each((_, el) => {
        stories.push(extractStory($(el)));
    });

    return stories;
}