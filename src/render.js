import { capitalizeFirstLetter, uncapitalizeFirstLetter } from "./util.js";

export const Render = (function() {
    function renderSidebar(element, allElements) {
        Object.values(allElements).forEach(el => el.classList.remove("active"));
        element.classList.add("active");
        sessionStorage.setItem("activeTab", element.id);
    }

    function renderTabPrj(listProjects, newProject) {
        const project = document.createElement("li");
        const id = uncapitalizeFirstLetter(newProject.title);
        project.classList.add("tab-list");
        project.classList.add("project");
        if (newProject.color !== "black") {
            project.classList.add("colored");
        }
        project.innerHTML = `
            <a id="${id}" class="tab">
            <span class="icon">
                <svg style="fill: var(--prj-${newProject.color})" width="800px" height="800px" viewBox="0 0 24.00 24.00" id="meteor-icon-kit__solid-view-grid" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="0.00024000000000000003">
                <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                <g id="SVGRepo_iconCarrier">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M2 0H9C10.1046 0 11 0.89543 11 2V9C11 10.1046 10.1046 11 9 11H2C0.89543 11 0 10.1046 0 9V2C0 0.89543 0.89543 0 2 0ZM15 0H22C23.1046 0 24 0.89543 24 2V9C24 10.1046 23.1046 11 22 11H15C13.8954 11 13 10.1046 13 9V2C13 0.89543 13.8954 0 15 0ZM2 13H9C10.1046 13 11 13.8954 11 15V22C11 23.1046 10.1046 24 9 24H2C0.89543 24 0 23.1046 0 22V15C0 13.8954 0.89543 13 2 13ZM15 13H22C23.1046 13 24 13.8954 24 15V22C24 23.1046 23.1046 24 22 24H15C13.8954 24 13 23.1046 13 22V15C13 13.8954 13.8954 13 15 13Z"/>
                </g>
                </svg>
            </span>${newProject.title}</a>
            <div class="counter"></div>
            <button class="btn-edit" type="button"></button>
        `
        listProjects.appendChild(project);
    }

    function renderPrjColorOption() {
        const customList = document.getElementById("list-select-custom");
        customList.classList.toggle("expanded");
    }

    function updatePrjColorOption(colorValue, customSelect) {
        const colorName = capitalizeFirstLetter(colorValue);
        customSelect.innerHTML = `
        <span class="icon" style="background-color: var(--prj-${colorValue})"></span>
        <span class="text">${colorName}</span>
        `
    }

    function renderHeading(heading) {
       let activeTab = document.querySelector(".tab-list.active > .tab");
       return heading.textContent = activeTab.textContent;
    }

    function toggleSidebar(sidebar, btn) {
        switch (true) {
            case (sidebar.classList.contains("normal")):
                sidebar.classList.add("collapsed");
                sidebar.classList.remove("normal");
                btn.classList.add("collapsed");
                btn.classList.remove("normal");
                break;
            case (sidebar.classList.contains("collapsed")):
                sidebar.classList.add("normal");
                sidebar.classList.remove("collapsed");
                btn.classList.add("normal");
                btn.classList.remove("collapsed");
                break;
        }
    }

    function toggleTheme(btn) {
        if(btn.classList.contains("light")){
            document.documentElement.classList.toggle("dark");
            btn.classList.add("dark");
            btn.classList.remove("light");
        } else {
            document.documentElement.classList.toggle("dark");
            btn.classList.add("light");
            btn.classList.remove("dark");
        }
        
    }

    function renderSubtaskList(list, input) {
        const id = crypto.randomUUID();
        const subtask = document.createElement("li");
        subtask.innerHTML = `
            <div class="checkbox-wrapper">
                <input class="default-checkbox" type="checkbox" id="${id}">
                <div class="custom-checkbox"></div>
            </div>
            <label for="${id}">${input.value}</label>
            <button type="button" class="btn-delete-subtask"></button>
        `;

        list.appendChild(subtask);
    }

    function closeDialog(dialog, reset) {
        dialog.close();
    }

    function resetNewTaskDialog(inputs, list) {
        inputs.forEach(input => input.value="");
        list.replaceChildren();
    }

    function resetNewPrjDialog(inputs, select) {
        inputs.forEach(input => input.value="");
        select.innerHTML = `
            <span class="icon" style="background-color: var(--prj-black)"></span>
            <span class="text">Black</span>
        `
    }

    function renderTask(tasksContainer, taskObj) {
        const task = document.createElement("div");
        task.classList.add("task");

        let project = "";
        if (typeof taskObj === 'string') {
            project = taskObj
        }   else {
            project = "";
        }

        task.innerHTML = `
            <button type="button" class="checkbox"></button>
            <div class="left">
                <div class="text">
                    <h3 class="title">${taskObj.title}<h3>
                    <p class="desc">${taskObj.desc}</p>
                </div>
                <div class="details">
                    <div class="date"><span class="icon"></span>${taskObj.dueDate}</div>
                    <div class="checklist"><span class="icon"></span></div> 
                </div>
            </div>

            <div class="right">
                <div class="buttons">
                    <button type="button" class="btn-edit"></button>
                    <button type="button" class="btn-delete"></button>
                </div>
                <div class="from">${project}</div>
            </div>

        `
        tasksContainer.appendChild(task);
    }

    return {
        renderSidebar,
        toggleSidebar,
        toggleTheme,
        renderHeading,
        closeDialog,
        resetNewTaskDialog,
        renderSubtaskList,
        renderTask,
        renderPrjColorOption,
        updatePrjColorOption,
        resetNewPrjDialog,
        renderTabPrj,
    }
})();