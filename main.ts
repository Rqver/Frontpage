import {getTopTheSpinoffStories} from "./modules/thespinoff.ts";
import {getTopRNZStories} from "./modules/rnz.ts";
import {getTopHeraldStories} from "./modules/herald.ts";
import {getTopNewsroomStories} from "./modules/newsroom.ts";

console.log(await getTopNewsroomStories())