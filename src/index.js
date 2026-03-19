import "./styles/styles.css";
import { elements, allTabs, allNewTaskInputs, allNewPrjInputs } from "./elements";
import { Init } from "./init.js";
import { EventHandler } from "./eventHandler.js";
import { ProjectsStore } from "./projectsStore.js";
import { TasksStore } from "./tasksStore.js";
import { formatDates } from "./util.js";

// // TODO expanding subtasks
// // TODO animation on subtasks
//!// fix check state on subtasks in edit task form

//!// UI:
//!// media query for sort and filter windows
//!//  + adjust windows for dark theme
Init.run(elements.heading, elements.tabProjects, elements.tasks);
EventHandler.init();

