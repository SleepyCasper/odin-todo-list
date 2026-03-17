import "./styles/styles.css";
import { elements, allTabs, allNewTaskInputs, allNewPrjInputs } from "./elements";
import { Init } from "./init.js";
import { EventHandler } from "./eventHandler.js";
import { ProjectsStore } from "./projectsStore.js";
import { TasksStore } from "./tasksStore.js";
import { formatDates } from "./util.js";

// // ! Fix bugs in event handler 
    // //d + "no-project"
// // ! Project name doesn't get updated in task card after editing project
// // ! Custom select color project doesn't auto close when canceling change
// // TODO editing and deleting tasks
    // // TODO asc/desc toggle
// TODO expanding task card
// // TODO sort and filter modules
    // // ! filter subselect value gets changed to "all" when switching tabs
    // // ! filter doesn't work fully with sorting

Init.run(elements.heading, elements.tabProjects, elements.tasks);
EventHandler.init();

