import "./styles/styles.css";
import { elements, allTabs, allNewTaskInputs, allNewPrjInputs } from "./elements";
import { Init } from "./init.js";
import { EventHandler } from "./eventHandler.js";
import { ProjectsStore } from "./projectsStore.js";
import { TasksStore } from "./tasksStore.js";
import { formatDates } from "./util.js";

// TODO editing and deleting tasks
// TODO expanding task card
// TODO sort and filter modules

Init.run(elements.heading, elements.tabProjects, elements.tasks);
EventHandler.init();

