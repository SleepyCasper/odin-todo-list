import "./styles/styles.css";
import { Render } from "./render.js";
import { Init } from "./init.js";
import { Task } from "./taskConstructor.js";
import { TasksStore } from "./tasksStore.js";
import { Project } from "./prjConstructor.js";
import { ProjectsStore } from "./projectsStore.js";

// TODO 1. eventListener on edit project
// TODO 2. add choose project in new task dialog
// TODO 3. project visibility in task card
// TODO 4. track on subtasks

const elements = {
    buttons: {
        newTask: document.querySelectorAll(".btn-new-task"),
        newProject: document.getElementById("btn-new-project"),
        sidebar: document.getElementById("btn-sidebar"),
        toggleTheme: document.getElementById("btn-toggle-theme"),
        editProject: document.querySelectorAll(".btn-edit-project"),
    },
    tabs: {
        allTasks: document.getElementById("tab-all"),
        today: document.getElementById("tab-today"),
        upcoming: document.getElementById("tab-upcoming"),
        completed: document.getElementById("tab-completed"),
    },
    tabProjects: document.getElementById("tab-projects"),
    formNewTask: {
        form: document.getElementById("form-new-task"),
        dialog: document.getElementById("dialog-new-task"),
        inputTitle: document.getElementById("input-task-title"),
        inputDesc: document.getElementById("input-task-desc"),
        inputSubtask: document.getElementById("input-task-subtask"),
        btnNewSubtask: document.getElementById("btn-task-subtask"),
        listSubtasks: document.getElementById("list-task-subtask"),
        btnCreate: document.getElementById("btn-task-create"),
        btnCancel: document.getElementById("btn-task-cancel"),
    },
    formNewProject: {
        form: document.getElementById("form-new-project"),
        dialog: document.getElementById("dialog-new-project"),
        inputTitle: document.getElementById("input-project-title"),
        inputColorHidden: document.getElementById("selected-color-value"),
        customSelectDropdown: document.getElementById("btn-dropdown-custom"),
        customColorOptions: document.querySelectorAll("#list-select-custom li"),
        btnCancel: document.getElementById("btn-project-cancel"),
        btnCreate: document.getElementById("btn-project-create"),
    },
    projects: document.querySelectorAll(".project"),
    counters: document.querySelectorAll(".counter"),
    sidebar: document.querySelector(".sidebar"),
    heading: document.getElementById("heading"),
    tasks: document.getElementById("tasks-container"),
}

const allTabs = [...Object.values(elements.tabs), ...elements.projects];
const allNewTaskInputs = [
    elements.formNewTask.inputTitle,
    elements.formNewTask.inputDesc,
    elements.formNewTask.inputSubtask
];

const allNewPrjInputs = [
    elements.formNewProject.inputTitle,
    elements.formNewProject.inputColorHidden
]

const EventHandler = (function(){
    document.querySelector(".sidebar").addEventListener("click", (e) => {
        const tabItem = e.target.closest(".tab-list");
        if (!tabItem) return;
        const allTabItems = document.querySelectorAll(".tab-list");
        allTabItems.forEach(el => el.classList.remove("active"));
        tabItem.classList.add("active");
        sessionStorage.setItem("activeTab", tabItem.dataset.id);
        Render.renderHeading(elements.heading);
    });

    // Edit project button event listener:
    let editingProjectId = null;
    
    elements.tabProjects.addEventListener("click", (e) => {
        const editBtn = e.target.closest(".btn-edit-project");
        if (!editBtn) return;

        const li = editBtn.closest("[data-id]");
        const projectId = li?.dataset.id;
        console.log(editBtn, "is clicked");

        const project = ProjectsStore.getById(projectId);
        console.log("Edit project:", project);
        if (!project) return;

        editingProjectId = project.id; 

        //Changing dialog
        elements.formNewProject.inputTitle.value = project.title;
        elements.formNewProject.btnCreate.textContent = "Update";
        Render.updatePrjColorOption(project.color, elements.formNewProject.customSelectDropdown);
        elements.formNewProject.inputColorHidden.value = project.color;
        elements.formNewProject.dialog.showModal()
    })

    elements.buttons.sidebar.addEventListener("click", () => 
        Render.toggleSidebar(elements.sidebar, elements.buttons.sidebar));

    elements.buttons.toggleTheme.addEventListener("click", () => 
        Render.toggleTheme(elements.buttons.toggleTheme));

    elements.buttons.newTask.forEach(btn => {
        btn.addEventListener("click", () => {
            elements.formNewTask.dialog.showModal()
        });
    });

    elements.buttons.newProject.addEventListener("click", () => elements.formNewProject.dialog.showModal());


    // NEW TASK DIALOG

    elements.formNewTask.btnNewSubtask.addEventListener("click", () => {
        if(elements.formNewTask.inputSubtask.value) {
            Render.renderSubtaskList(elements.formNewTask.listSubtasks, elements.formNewTask.inputSubtask);
            elements.formNewTask.inputSubtask.value = "";
        } else {return}
    });

    elements.formNewTask.listSubtasks.addEventListener("click", (e) => {
        const li = e.target.closest("li")
        const checkbox = e.target.closest("input[type='checkbox']");
        const btnDelete = e.target.closest(".btn-delete-subtask");

        if (checkbox) {
            const label = li.querySelector("label");
            if (label) label.classList.toggle("checked", checkbox.checked);
        }

        if (btnDelete) {
            li.remove();
        }
    })

    elements.formNewTask.form.addEventListener("submit", (e) => {
        e.preventDefault();
        const newTask = createNewTask();
        Render.renderTask(elements.tasks, newTask);
        Render.closeDialog(elements.formNewTask.dialog, Render.resetNewTaskDialog(allNewTaskInputs, elements.formNewTask.listSubtasks))
        console.log(TasksStore.tasks);
    });

    elements.formNewTask.btnCancel.addEventListener("click", () => 
        Render.closeDialog(elements.formNewTask.dialog, Render.resetNewTaskDialog(allNewTaskInputs, elements.formNewTask.listSubtasks)));

    // NEW PROJECT DIALOG

    elements.formNewProject.customSelectDropdown.addEventListener("click", () => {
        Render.renderPrjColorOption();
    })

    elements.formNewProject.customColorOptions.forEach(option => {
        option.addEventListener("click", () => {
            setColorValue(option);
            Render.updatePrjColorOption(option.getAttribute('data-value'), elements.formNewProject.customSelectDropdown);
            Render.renderPrjColorOption();
        })
    })

    elements.formNewProject.btnCancel.addEventListener("click", () => {
        Render.closeDialog(elements.formNewProject.dialog, Render.resetNewPrjDialog(allNewPrjInputs, elements.formNewProject.customSelectDropdown));
    })

    elements.formNewProject.form.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(elements.formNewProject.form);

        if (editingProjectId) {
            // UPDATE existing project
            ProjectsStore.update(editingProjectId, {
                title: formData.get("title"),
                color: formData.get("project-color"),
            });
            const li = document.querySelector(`[data-id="${editingProjectId}"]`);
            Render.updateTabPrj(li, ProjectsStore.getById(editingProjectId)); // re-render the li
            editingProjectId = null;
        } else {
            // CREATE new project
            const newPrj = createNewProject();
            Render.renderTabPrj(elements.tabProjects, newPrj);
        }

        Render.closeDialog(elements.formNewProject.dialog, Render.resetNewPrjDialog(allNewPrjInputs, elements.formNewProject.customSelectDropdown));
        elements.formNewProject.btnCreate.textContent = "Create";
        Render.renderHeading(elements.heading);
        console.log(ProjectsStore.getProjects());
    })
})();

function createNewTask() {
    const formData = new FormData(elements.formNewTask.form);
    const subtasks = [...elements.formNewTask.listSubtasks.querySelectorAll("li")]
        .map(li => ({
            text: li.querySelector("label").textContent,
            done: li.querySelector("input").checked
        }));
    
    const newTask = new Task(
        formData.get("title"),
        formData.get("desc"),
        formData.get("date"),
        formData.get("priority"),
        subtasks,
        );

    TasksStore.add(newTask);
    return newTask;
}

function createNewProject() {
    const formPrjData = new FormData(elements.formNewProject.form);

    const newProject = new Project (
        formPrjData.get("title"),
        formPrjData.get("project-color"),
    );

    ProjectsStore.add(newProject);
    return newProject;
}

function setColorValue(option) {
    elements.formNewProject.inputColorHidden.value = option.getAttribute("data-value");
    console.log(elements.formNewProject.inputColorHidden.value);
}


Init.run(allTabs, elements.heading, elements.tabProjects);

