import { Render } from "./render.js";

export const Init = (function(){
    function activeTabByDefault(allTabs) {
        const savedId = sessionStorage.getItem("activeTab");
        const tab = savedId ? document.getElementById(savedId) : document.getElementById("tab-all");
        Render.renderSidebar(tab, allTabs);
    }

    function run(allTabs, elements) {
        activeTabByDefault(allTabs);
        Render.renderHeading(elements.heading);
    }

    return {
        run,
    }
})();