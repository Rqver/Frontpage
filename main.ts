import {getTopTheSpinoffStories} from "./modules/thespinoff.ts";
import {getTopRNZStories} from "./modules/rnz.ts";
import {getTopHeraldStories} from "./modules/herald.ts";
import {getTopNewsroomStories} from "./modules/newsroom.ts";
import {getTopBusinessDeskStories} from "./modules/businessdesk.ts";

console.log(await getTopBusinessDeskStories())