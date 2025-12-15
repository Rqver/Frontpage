import {Story} from "../../types.ts";
import {Site} from "../site-handler.ts";

const targetedFrames = ["defcon", "top-stories-stuff"]

export const site: Site = {
    name: "Stuff",
    id: "stuff",
    image: "/img/stuff.png",
    rank: 0,
    check: async function(): Promise<Story[]> {
        const res = await fetch("https://www.stuff.co.nz/api/v1.0/stuff/page?path=home");
        const json = await res.json();

        const sources = [];
        for (const frame of json.page.frames){
            if (targetedFrames.some(t => frame.frame.includes(t))){
                sources.push(frame.source);
            }
        }

        const stories: Story[] = [];

        for (const module of json.data){
            if (sources.some(src => module.filter === src)) {
                for (const story of module.stories){
                    stories.push({
                        title: story.content.title as string,
                        isBreaking: story.liveBlog || story.breaking || false,
                        link: `https://stuff.co.nz${story.content.url}`
                    })
                }
            }
        }

        return stories;
    }
}