import * as cheerio from 'npm:cheerio';
import { Story } from "../../types.ts";
import {Site} from "../site-handler.ts";

export const site: Site = {
    id: "newsroom",
    name: "Newsroom",
    image: "/img/newsroom.png",
    rank: 5,
    check: async function(): Promise<Story[]> {
        const res = await fetch("https://newsroom.co.nz/");
        const text = await res.text();

        const $ = cheerio.load(text);
        const stories: Story[] = [];

        const articleElements = $(".wp-block-newspack-blocks-homepage-articles article");

        for (const articleElement of articleElements){
            const element = $(articleElement);
            const headlineTag = element.find(".entry-title a").first();

            stories.push({
                title: headlineTag.text().trim(),
                isBreaking: false,
                link: headlineTag.attr("href") || ""
            })
        }

        return stories;
    }
}