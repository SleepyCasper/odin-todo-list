import { Render } from "./render.js";
import { Project } from "./prjConstructor.js";
import { ProjectsStore } from "./projectsStore.js";

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
            null,
            "demo-studying"
        )

        const project2 = new Project (
            "Home",
            "yellow",
            null,
            "demo-home"
        )

        ProjectsStore.add(project1);
        ProjectsStore.add(project2);

        Render.renderTabPrj(listProjects, project1);
        Render.renderTabPrj(listProjects, project2);
    }

    function run(allTabs, heading, listProjects) {
        demoProjects(listProjects);
        activeTabByDefault(allTabs);
        Render.renderHeading(heading);
    }

    return {
        run,
    }
})();