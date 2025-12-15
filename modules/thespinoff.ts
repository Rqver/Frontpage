import {Story} from "../types.ts";

export async function getTopTheSpinoffStories(): Promise<Story[]> {
    const res = await fetch("https://thespinoff.co.nz/api/posts?offset=0&limit=20");
    const json = await res.json();

    const stories: Story[] = [];

    for (const story of json){
        // don't know why this endpoint doesn't have a url field but we have to make it
        const link = `https://thespinoff.co.nz/${story._category}/${story.date.split("T")[0].trim().split("-").reverse().join("-")}/${story.slug}`

        stories.push({
            title: story.title,
            isBreaking: false,
            link: link
        })
    }


    return stories
}
