import {Story} from "../../types.ts";
import {Site} from "../site-handler.ts";

const targetedFrames = ["top-stories", "medium-story-grid"]

export const site: Site = {
    name: "The Post",
    id: "the_post",
    image: "/img/the-post.png",
    rank: 3,
    check: async function (): Promise<Story[]> {
        const res = await fetch("https://www.thepost.co.nz/api/v1.0/the-post/page?path=home");
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
                        link: `https://thepost.co.nz${story.content.url}`
                    })
                }
            }
        }

        return stories;
    }
}