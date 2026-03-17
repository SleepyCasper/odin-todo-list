import { capitalizeFirstLetter, uncapitalizeFirstLetter } from "./util.js";
import { elements } from "./elements.js";
import { ProjectsStore } from "./projectsStore.js";
import { TasksStore } from "./tasksStore.js";
import { formatDates, filter } from "./util.js";
import { isToday, isFuture, isPast, format, isTomorrow, isWithinInterval, addDays } from "date-fns";

export const Render = (function() {
    function renderSidebar(element, allElements) {
        Object.values(allElements).forEach(el => el.classList.remove("active"));
        element.classList.add("active");
        sessionStorage.setItem("activeTab", element.dataset.id || element.id);
    }

    function renderTabPrj(listProjects, newProject) {
        const project = document.createElement("li");
        project.classList.add("tab-list");
        project.classList.add("project");
        project.setAttribute("data-id", newProject.id);

        project.innerHTML = `
            <a class="tab">
            <span class="icon">
                <svg style="fill: var(--prj-${newProject.color})" width="800px" height="800px" viewBox="0 0 24.00 24.00" id="meteor-icon-kit__solid-view-grid" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="0.00024000000000000003">
                <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                <g id="SVGRepo_iconCarrier">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M2 0H9C10.1046 0 11 0.89543 11 2V9C11 10.1046 10.1046 11 9 11H2C0.89543 11 0 10.1046 0 9V2C0 0.89543 0.89543 0 2 0ZM15 0H22C23.1046 0 24 0.89543 24 2V9C24 10.1046 23.1046 11 22 11H15C13.8954 11 13 10.1046 13 9V2C13 0.89543 13.8954 0 15 0ZM2 13H9C10.1046 13 11 13.8954 11 15V22C11 23.1046 10.1046 24 9 24H2C0.89543 24 0 23.1046 0 22V15C0 13.8954 0.89543 13 2 13ZM15 13H22C23.1046 13 24 13.8954 24 15V22C24 23.1046 23.1046 24 22 24H15C13.8954 24 13 23.1046 13 22V15C13 13.8954 13.8954 13 15 13Z"/>
                </g>
                </svg>
            </span>${newProject.title}</a>
            <div class="counter">${newProject.counter}</div>
            <button class="btn-details" type="button"></button>
            <div class="details">
                <div class="btn-edit"><span class="icon"></span>Edit</div>
                <div class="btn-delete"><span class="icon"></span>Delete</div>
            </div>        `
        listProjects.appendChild(project);

        if (newProject.counter === 0) {
            project.querySelector(".counter").style = "opacity: 0";
        }
    }

    function updateTabPrj(li, project) {
        li.innerHTML = `
            <a class="tab">
            <span class="icon">
                <svg style="fill: var(--prj-${project.color})" width="800px" height="800px" viewBox="0 0 24.00 24.00" id="meteor-icon-kit__solid-view-grid" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="0.00024000000000000003">
                <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                <g id="SVGRepo_iconCarrier">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M2 0H9C10.1046 0 11 0.89543 11 2V9C11 10.1046 10.1046 11 9 11H2C0.89543 11 0 10.1046 0 9V2C0 0.89543 0.89543 0 2 0ZM15 0H22C23.1046 0 24 0.89543 24 2V9C24 10.1046 23.1046 11 22 11H15C13.8954 11 13 10.1046 13 9V2C13 0.89543 13.8954 0 15 0ZM2 13H9C10.1046 13 11 13.8954 11 15V22C11 23.1046 10.1046 24 9 24H2C0.89543 24 0 23.1046 0 22V15C0 13.8954 0.89543 13 2 13ZM15 13H22C23.1046 13 24 13.8954 24 15V22C24 23.1046 23.1046 24 22 24H15C13.8954 24 13 23.1046 13 22V15C13 13.8954 13.8954 13 15 13Z"/>
                </g>
                </svg>
            </span>${project.title}</a>
            <div class="counter">${project.tasks.length}</div>
            <button class="btn-details" type="button"></button>
            <div class="details">
                <div class="btn-edit"><span class="icon"></span>Edit</div>
                <div class="btn-delete"><span class="icon"></span>Delete</div>
            </div>`;

        if (project.tasks.length === 0) {
            li.querySelector(".counter").style = "opacity: 0";
        }
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

    function renderSortFilter(btn) {
        switch(btn.id) {
            case "btn-sort" :
                document.getElementById("sort").style.display = "flex";
                break;
            case "btn-filter" :
                document.getElementById("filter").style.display = "flex";
                break;
        }
    }

    function renderFilterSubselect(action) {
        resetFilterSubselect();
        switch(action) {
            case "project":
                const projects = ProjectsStore.getProjects();
                projects.forEach(prj => {
                    const option = document.createElement("option");
                    option.value = prj.id;
                    option.textContent = prj.title;
                    elements.filter.subSelect.appendChild(option);
                })
                break;
            case "priority":
                const priorities = ["p1", "p2", "p3", "p4"];
                
                priorities.forEach(p => {
                    const option = document.createElement("option");
                    option.value = p;
                    option.textContent = `Priority ${p[1]}`;
                    elements.filter.subSelect.appendChild(option);
                })
                break;
        }
    }

    function resetFilterSubselect () {
        elements.filter.subSelect.innerHTML = `
        <option value="all">All</option>
        `
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

    function renderExistingSubtaskList(task) {
        if (task.subtasks) {
            task.subtasks.forEach(sub => {
                const subtask = document.createElement("li");
                subtask.innerHTML = `
                    <div class="checkbox-wrapper">
                        <input class="default-checkbox" type="checkbox" id="${sub.id}">
                        <div class="custom-checkbox"></div>
                    </div>
                    <label for="${sub.id}">${sub.text}</label>
                    <button type="button" class="btn-delete-subtask"></button>
                `
                elements.formNewTask.listSubtasks.appendChild(subtask);
            });
        } else return;
    }

    function renderPrjOptions (select) {
        const projects = ProjectsStore.getProjects();
        console.log("Projects array:", projects);

        const options = projects.map(prj => {
            const option = document.createElement("option");
            option.value = prj.title;
            option.textContent = prj.title;
            option.setAttribute("data-id", prj.id);
            return option;
        })

        const noProject = document.createElement("option");
        noProject.value = "no-project";
        noProject.textContent = "No project";
        noProject.setAttribute("data-id", "no-project");
        options.unshift(noProject);

        console.log(options);
        select.append(...options);
    }

    function resetPrjOptions(select) {
        select.replaceChildren();
        console.log("project options are reset");
    }

    function closeDialog(dialog, reset) {
        dialog.close();
    }

    function resetNewTaskDialog(inputs, list) {
        inputs.forEach(input => input.value="");
        elements.formNewTask.selectPriority.value = "p1"
        list.replaceChildren();
        elements.formNewTask.heading.textContent = "New task";
        elements.formNewTask.btnCreate.textContent = "Create";
    }

    function resetNewPrjDialog(inputs, select) {
        inputs.forEach(input => input.value="");
        select.innerHTML = `
            <span class="icon" style="background-color: var(--prj-black)"></span>
            <span class="text">Black</span>
        `
        elements.formNewProject.customList.classList.remove("expanded");
    }

    function renderTask(taskObj) {
        const tasksContainer = elements.tasks;
        const task = document.createElement("div");
        task.id = taskObj.id;
        task.classList.add("task");
        task.classList.add(taskObj.priority);
        if (taskObj.done) {
            task.classList.add("completed");
        }

        let date = formatDates(taskObj.dueDate);

        let project = "";
        if (typeof taskObj.project === 'string') {
            project = taskObj.project;
        }   else {
            project = "";
        }

        task.innerHTML = `
            <button type="button" class="checkbox"></button>
            <div class="left">
                <div class="text">
                    <h3 class="title">${taskObj.title}</h3>
                    <p class="desc">${taskObj.desc}</p>
                </div>
                <div class="details">
                    <div class="date"><span class="icon"></span>${date}</div>
                    <div class="checklist"><span class="icon"></span>${taskObj.subtasksDoneLength}/${taskObj.subtasksLength}</div> 
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
        console.log(task);
    }

    function resetTaskContainer() {
        elements.tasks.innerHTML = "";
    }

    function renderTasksByTabs(tab, filterState, subValue) {
        let tabId = tab.id;
        let tabDataId = tab.getAttribute("data-id");
        let tasks = TasksStore.getAll();
        let filteredTasks;

        if(tabId) {
            switch (tabId) {
                case "tab-all": 
                    tasks = tasks.filter(task => !task.done);
                    console.log("Tasks in active tab:", tasks);
                    break;

                case "tab-today":
                    tasks = tasks.filter(task => isToday(task.dueDate) && !task.done);
                    console.log("Tasks in active tab:", tasks);
                    break;

                case "tab-upcoming":
                    tasks = tasks.filter(task => isFuture(task.dueDate) && !task.done);
                    console.log("Tasks in active tab:", tasks);
                    break;

                case "tab-completed":
                    tasks = tasks.filter(task => task.done);
                    console.log("Tasks in active tab:", tasks);
                    break;
            }
        } else {
            tasks = tasks.filter(task => task.projectID === tabDataId && !task.done);
            console.log("Tasks in active tab:", tasks);
        }

        // Filter
        if (filterState) {
            filteredTasks = filter(tasks, filterState, subValue);
        }
        
        /* console.log(filterState);
        console.log(subValue);
        console.log(tabId || tabDataId); */
        resetTaskContainer()
        filteredTasks.forEach(task => renderTask(task));
    }

    function rerenderTasksOnProjectUpdate(oldTitle, updatedProject) {
        const tasksContainer = elements.tasks;
        tasksContainer.querySelectorAll(".task").forEach(taskEl => {
            const fromEl = taskEl.querySelector(".from");
            if (fromEl && fromEl.textContent === oldTitle) {
                fromEl.textContent = updatedProject.title;
            }
        });
    }

    function renderCounters(tab) {
        const tabId = tab.id;
        const counter = tab.querySelector(".counter");
        if (!counter) return;
        let count = 0;
        switch (tabId) {
            case "tab-all":
                count = counter.textContent = TasksStore.tasks.filter(task => task.done == false).length;
                break;

            case "tab-completed":
                count = counter.textContent = TasksStore.tasks.filter(task => task.done == true).length;
                break;
            
            case "tab-today":
                count = counter.textContent = TasksStore.tasks.filter(task => isToday(task.dueDate) && !task.done).length;
                break;
            case "tab-upcoming":
                count = counter.textContent = TasksStore.tasks.filter(task => isFuture(task.dueDate) && !task.done).length;
                break;
            default: // project tabs
                const tabDataId = tab.getAttribute("data-id");
                count = TasksStore.tasks.filter(task => task.projectID === tabDataId && !task.done).length;
                break;
        }

        counter.textContent = count;
        counter.style.display = count === 0 ? "none" : "block";
        counter.style.opacity = count === 0 ? "0" : "1";
    }

    return {
        renderSidebar,
        toggleSidebar,
        toggleTheme,
        renderHeading,
        renderSortFilter,
        renderFilterSubselect,
        resetFilterSubselect,
        closeDialog,
        resetNewTaskDialog,
        renderSubtaskList,
        renderExistingSubtaskList,
        renderTask,
        renderPrjOptions,
        resetPrjOptions,
        renderPrjColorOption,
        updatePrjColorOption,
        resetNewPrjDialog,
        renderTabPrj,
        updateTabPrj,
        rerenderTasksOnProjectUpdate,
        renderTasksByTabs,
        renderCounters,
    }
})();