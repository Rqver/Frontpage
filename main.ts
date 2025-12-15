import {getTopTheSpinoffStories} from "./modules/thespinoff.ts";
import {getTopRNZStories} from "./modules/rnz.ts";
import {getTopHeraldStories} from "./modules/herald.ts";

console.log(await getTopHeraldStories())