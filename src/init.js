import { Render } from "./render.js";
import { Project } from "./prjConstructor.js";
import { Task } from "./taskConstructor.js";
import { ProjectsStore } from "./projectsStore.js";
import { TasksStore } from "./tasksStore.js";

export const Init = (function(){
    function activeTabByDefault(allTabs) {
        const savedId = sessionStorage.getItem("activeTab");
        let tab = document.querySelector(`[data-id="${savedId}"]`);
        if (!tab) {
            tab = document.getElementById("tab-all");
        }
        if (tab) {
        Render.renderSidebar(tab, allTabs);
    }
    }

    function demoProjects(listProjects) {
        const project1 = new Project (
            "Studying",
            "pink",
            [],
            "demo-studying"
        )

        const project2 = new Project (
            "Home",
            "yellow",
            [],
            "demo-home"
        )

        ProjectsStore.add(project1);
        ProjectsStore.add(project2);

        Render.renderTabPrj(listProjects, project1);
        /* Render.renderTabPrj(listProjects, project2); */
    }

    function demoTasks(tasksContainer, listProjects) {  
        const projectHome = ProjectsStore.projects.find(prj => prj.title === "Home");
        const task1 = new Task (
            "Buy groceries",
            "",
            "2026-03-05",
            "p1",
            [],
            null,
            null
        );

        const task2 = new Task (
            "Clean living room",
            "",
            "2026-03-05",
            "p2",
            [],
            projectHome.title,
            projectHome.id
        )

        TasksStore.add(task1);
        TasksStore.add(task2);
        projectHome.tasks.push(task2);

        Render.renderTask(tasksContainer, task1);
        Render.renderTask(tasksContainer, task2);
        Render.renderTabPrj(listProjects, projectHome);
    }

    function run(allTabs, heading, listProjects, tasksContainer) {
        demoProjects(listProjects);
        demoTasks(tasksContainer, listProjects);
        activeTabByDefault(allTabs);
        Render.renderHeading(heading);
    }

    return {
        run,
    }
})();