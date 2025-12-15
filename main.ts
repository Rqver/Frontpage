import express from "npm:express"
import {Story} from "./types.ts";
import {setupSites, Site} from "./websites/site-handler.ts";

const cache : Map<string, Story[]> = new Map();
let sites: Site[] = [];

async function refreshCache(){
    for (const site of sites){
        const stories = await site.check();
        cache.set(site.id, stories)
    }
}

async function main(){
    console.log("Registering sites..");
    sites = await setupSites();

    console.log("Refreshing cache...");
    await refreshCache();

    console.log("Creating express server");
    const app = express();
    app.get("/api/get-sites", function(_: Request, res: Response){
        const data = sites.map(site => ({
            id: site.id,
            name: site.name,
            image: site.image,
            stories: cache.get(site.id),
        }));

        res.json(data)
    })

    app.listen(9696);
    console.log("Listening on 9696")
}

Deno.cron("Refresh cache", "* * * * *", refreshCache)
main()
