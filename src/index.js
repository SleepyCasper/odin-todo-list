import "./styles/styles.css";
import { elements, allTabs, allNewTaskInputs, allNewPrjInputs } from "./elements";
import { Init } from "./init.js";
import { EventHandler } from "./eventHandler.js";
import { ProjectsStore } from "./projectsStore.js";
import { TasksStore } from "./tasksStore.js";
import { formatDates } from "./util.js";

// // ! fix bug with prj details window
// // TODO converting dates
// // TODO render tasks accordingly to tabs
// // TODO make checkbox on tasks functional
// TODO editing and deleting tasks
// TODO expanding task card
// // TODO counters on tabs 
// // TODO add other cases to renderCounters()

// TODO sort and filter modules



Init.run(elements.heading, elements.tabProjects, elements.tasks);
EventHandler.init();

