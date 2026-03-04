export const elements = {
    buttons: {
        newTask: document.querySelectorAll(".btn-new-task"),
        newProject: document.getElementById("btn-new-project"),
        sidebar: document.getElementById("btn-sidebar"),
        toggleTheme: document.getElementById("btn-toggle-theme"),
        editProject: document.querySelectorAll(".btn-details"),
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
        inputDate: document.getElementById("input-task-date"),
        btnNewSubtask: document.getElementById("btn-task-subtask"),
        listSubtasks: document.getElementById("list-task-subtask"),
        selectProject: document.getElementById("select-project"),
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
    deleteProject: {
        dialog: document.getElementById("dialog-delete-project"),
        btnCancel: document.getElementById("btn-delete-project-cancel"),
        btnDelete: document.getElementById("btn-delete-project-delete"),
    },
    body: document.querySelector("body"),
    projects: document.querySelectorAll(".project"),
    counters: document.querySelectorAll(".counter"),
    sidebar: document.querySelector(".sidebar"),
    heading: document.getElementById("heading"),
    tasks: document.getElementById("tasks-container"),
}

export const allTabs = [...Object.values(elements.tabs), ...elements.projects];
export const allNewTaskInputs = [
    elements.formNewTask.inputTitle,
    elements.formNewTask.inputDesc,
    elements.formNewTask.inputSubtask,
    elements.formNewTask.inputDate
];

export const allNewPrjInputs = [
    elements.formNewProject.inputTitle,
    elements.formNewProject.inputColorHidden
]