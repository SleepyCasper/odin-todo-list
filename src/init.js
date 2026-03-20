import { Render } from "./render.js";
import { Project } from "./prjConstructor.js";
import { Task } from "./taskConstructor.js";
import { ProjectsStore } from "./projectsStore.js";
import { TasksStore } from "./tasksStore.js";
import { sort, filter } from "./util.js";
import { Storage} from "./storage.js";
import { elements } from "./elements.js";

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

    function setTheme() {
        const savedTheme = localStorage.getItem("theme");
        
        if (savedTheme === "dark") {
            document.documentElement.classList.add("dark");  // ← add this
            elements.buttons.toggleTheme.classList.add("dark");
            elements.buttons.toggleTheme.classList.remove("light");
        } else {
            elements.buttons.toggleTheme.classList.add("light");
            elements.buttons.toggleTheme.classList.remove("dark");
        }
    }

    function demoProjects() {
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
    }

    function demoTasks() {  
        const projectHome = ProjectsStore.projects.find(prj => prj.title === "Home");
        const task1 = new Task (
            "Buy groceries",
            "",
            new Date(),
            "p1",
            [],
            null,
            null
        );

        const task2 = new Task (
            "Clean living room",
            "",
            new Date(),
            "p2",
            [
                {
                    text: "Take out the trash",
                    done: false,
                    id: crypto.randomUUID()
                },
                {
                    text: "Vacuum cleaning",
                    done: false,
                    id: crypto.randomUUID()
                }
            ],
            projectHome.title,
            projectHome.id
        )

        TasksStore.add(task1);
        TasksStore.add(task2);
        projectHome.tasks.push(task2);
    }

    function run() {
        setTheme();

        // Importing form local storage
        const hasTasks = Object.keys(localStorage).some(key => key.startsWith("tasks:"));
        const hasProjects = Object.keys(localStorage).some(key => key.startsWith("projects:"));

        if(hasProjects) {
            Storage.importProjects();
        } else {
            demoProjects();
        }

        if(hasTasks) {
            Storage.importTasks();
        } else {
            demoTasks();
        }

        ProjectsStore.getAll().forEach(prj => Render.renderTabPrj(prj));
        
        // Setting active tab
        const allTabs = document.querySelectorAll(".tab-list");
        activeTabByDefault(allTabs);
        Render.renderHeading(elements.heading);
        allTabs.forEach(tab => {
            Render.renderCounters(tab);
        });

        // Sorting tasks
        sort("date", "ascending");
        
        // Rendering tasks
        const activeTab = document.querySelector(".tab-list.active");
        Render.renderTasksByTabs(activeTab, "all", "all");
    }

    return {
        run,
    }
})();