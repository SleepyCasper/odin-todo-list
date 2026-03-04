import "./styles/styles.css";
import { elements, allTabs, allNewTaskInputs, allNewPrjInputs } from "./elements";
import { Init } from "./init.js";
import { EventHandler } from "./eventHandler.js";
import { ProjectsStore } from "./projectsStore.js";

// ! fix bug with project details dialog
// TODO converting dates
// TODO render tasks accordingly to tabs
// TODO make checkbox on tasks functional
// TODO editing and deleting tasks
// TODO expanding task card
// TODO counters on tabs 

// TODO sort and filter modules


Init.run(allTabs, elements.heading, elements.tabProjects, elements.tasks);
EventHandler.init();
console.log(ProjectsStore.getProjects());
