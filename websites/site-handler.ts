import {join}  from "jsr:@std/path";
import {Story} from "../types.ts";

export interface Site {
    id: string;
    name: string;
    image: string;
    rank: number;
    check: () => Promise<Story[]>
}

function sortSites(a: Site, b: Site){
    return a.rank - b.rank
}


export async function setupSites(): Promise<Site[]> {
    const sites: Site[] = []

    for await (const dirEntry of Deno.readDir("./websites/sites")){
        if (dirEntry.isDirectory || !dirEntry.name.includes(".site")) continue;

        const sitePath = join('sites', dirEntry.name);
        let siteFile = await import(`./${sitePath}`);
        siteFile = siteFile.site;

        sites.push(siteFile)
    }

    return sites.sort(sortSites);
}