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
   sites = await setupSites();
   refreshCache()
}


Deno.cron("Refresh cache", "* * * * *", refreshCache)
main()
