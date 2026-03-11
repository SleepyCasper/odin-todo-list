import { elements, allTabs, allNewTaskInputs, allNewPrjInputs } from "./elements";
import { Render } from "./render.js";
import { createNewTask, createNewProject } from "./actions.js";
import { TasksStore } from "./tasksStore.js";
import { ProjectsStore } from "./projectsStore.js";
import { isToday, isFuture } from "date-fns";


export const EventHandler = {
    editingProjectId: null,

    init() {
        this._handleSidebar();
        this._handleProjectActions();
        this._handleProjectDelete();
        this._handleProjectForm();
        this._handleTaskActions();
        this._handleTaskForm();
        this._handleSubtaskLogic();
        this._handleGlobalUI();
    },

    // 1. Sidebar Tabs
    _handleSidebar() {
        document.querySelector(".sidebar").addEventListener("click", (e) => {
            const tabItem = e.target.closest(".tab-list");

            if (!tabItem) return;

            if (tabItem) {
                document.querySelectorAll(".tab-list").forEach(el => el.classList.remove("active"));
                tabItem.classList.add("active");
                sessionStorage.setItem("activeTab", tabItem.dataset.id);

                Render.renderHeading(elements.heading);
                Render.renderTasksByTabs(tabItem);
            }
        });
    },

    // 2. Project List Actions (Edit/Delete/Details)
    _handleProjectActions() {
        // Calling new project dialog
        elements.buttons.newProject.addEventListener("click", () => {
            elements.formNewProject.dialog.showModal();
        })

        elements.tabProjects.addEventListener("click", (e) => {
            const target = e.target;
            
            // Edit
            if (target.closest(".btn-edit")) {
                this._setupProjectEdit(target.closest("[data-id]").dataset.id);
            }
            
            // Delete
            if (target.closest(".btn-delete")) {
                this.editingProjectId = target.closest("[data-id]").dataset.id;
                elements.deleteProject.dialog.showModal();
            }

            // Details toggle
            if (target.closest(".btn-details")) {
                const win = target.closest(".btn-details").nextElementSibling;
                win.style.display = "flex";
            }
        });
    },

    _setupProjectEdit(id) {
            const project = ProjectsStore.getById(id);
            if (!project) return;

            this.editingProjectId = id; // Set the "State"

            // UI changes to show we are in "Edit Mode"
            elements.formNewProject.inputTitle.value = project.title;
            elements.formNewProject.btnCreate.textContent = "Update";

            Render.updatePrjColorOption(project.color, elements.formNewProject.customSelectDropdown);
            elements.formNewProject.dialog.showModal();
    },

    // 3. Creating and updating project
    _handleProjectForm() {
        // Submit new project form
        elements.formNewProject.form.addEventListener("submit", (e) => {
            e.preventDefault();
            if (this.editingProjectId) {
                this._processProjectUpdate();
            } else {
                this._processProjectCreate();
            }
            // Cleanup that happens regardless of Update or Create
            this._closeAndResetProjectForm();
        });

        // Cancel project form
        elements.formNewProject.btnCancel.addEventListener("click", () => {
            this._closeAndResetProjectForm();
        }),
        
        // Render custom color select
        elements.formNewProject.customSelectDropdown.addEventListener("click", () => {
            Render.renderPrjColorOption();
        })

        // Choose color
        elements.formNewProject.customColorOptions.forEach(option => {
            option.addEventListener("click", () => {
                this._setColorValue(option);
                Render.updatePrjColorOption(option.getAttribute('data-value'), elements.formNewProject.customSelectDropdown);
                Render.renderPrjColorOption();
            })
        })
    },

    _setColorValue(option) {
        elements.formNewProject.inputColorHidden.value = option.getAttribute("data-value");
        console.log(elements.formNewProject.inputColorHidden.value);
    },

    _processProjectUpdate() {
        const formData = new FormData(elements.formNewProject.form);
        const id = this.editingProjectId;
        ProjectsStore.update(id, {
            title: formData.get("title"),
            color: formData.get("project-color"),
        });
        const li = document.querySelector(`[data-id="${id}"]`);
        Render.updateTabPrj(li, ProjectsStore.getById(id));
    },

    _processProjectCreate() {
        const newPrj = createNewProject();
        Render.renderTabPrj(elements.tabProjects, newPrj);
    },

    _closeAndResetProjectForm() {
        this.editingProjectId = null; // Clear the state
        elements.formNewProject.btnCreate.textContent = "Create";
        Render.closeDialog(elements.formNewProject.dialog, Render.resetNewPrjDialog(allNewPrjInputs, elements.formNewProject.customSelectDropdown));
    },

    // 3.2 Deleting project
    _handleProjectDelete() {
        // Delete button
        elements.deleteProject.btnDelete.addEventListener("click", () => {
            const project = ProjectsStore.getById(this.editingProjectId);
            const tabPrj = document.querySelector(`[data-id="${this.editingProjectId}"]`);
            const tasks = TasksStore.getByPrjID(this.editingProjectId);

            tasks.forEach(task => TasksStore.delete(task)); // delete tasks of the project
            ProjectsStore.delete(project); // delete project
            tabPrj.remove(); // delete li element

            allTabs.forEach(tab => Render.renderCounters(tab)); // rerender tab counters
            elements.tabs.allTasks.classList.add("active"); // make all tasks tab active
            Render.renderTasksByTabs(elements.tabs.allTasks);
            Render.closeDialog(elements.deleteProject.dialog);
            this.editingProjectId = null;
        })

        // Cancel
        elements.deleteProject.btnCancel.addEventListener("click", () => {
            Render.closeDialog(elements.deleteProject.dialog);
            this.editingProjectId = null;
        })
    },

    // 4. Creating Tasks and interactions with existing tasks in the list

    _handleTaskActions() {
        elements.buttons.newTask.forEach(btn => {
            btn.addEventListener("click", () => {
                Render.renderPrjOptions(elements.formNewTask.selectProject);
                elements.formNewTask.dialog.showModal()
            });
        });

        elements.tasks.addEventListener("click", (e) => {
            const checkbox = e.target.closest(".checkbox");
            if (checkbox) this._completeTask(checkbox);

            // You could easily add Edit/Delete task buttons here too
        });
    },

    async _completeTask(checkbox) {
        const taskCard = checkbox.closest(".task");
        const taskObj = TasksStore.getById(taskCard.id);

        taskCard.classList.add("deleting");

        // UI Animation
        await new Promise(res => {
            taskCard.addEventListener("transitionend", (e) => {
                if (e.propertyName === "height") {
                    res();
                }
            });
        });

        taskCard.remove();

        // Data Update
        TasksStore.update(taskObj.id, { done: true });

        // If part of a project, sync the project view
        if (taskObj.projectID) {
            this._syncProjectView(taskObj.projectID);
        }

        this._refreshGlobalCounters();
    },

    // 4.2 Logic inside the "New Task" Dialog
    _handleSubtaskLogic() {
        // Adding a subtask
        elements.formNewTask.btnNewSubtask.addEventListener("click", () => {
            const val = elements.formNewTask.inputSubtask.value;
            if (!val) return;

            Render.renderSubtaskList(elements.formNewTask.listSubtasks, elements.formNewTask.inputSubtask);
            elements.formNewTask.inputSubtask.value = "";
        });

        // Managing the subtask list (Check/Delete)
        elements.formNewTask.listSubtasks.addEventListener("click", (e) => {
            const li = e.target.closest("li");
            if (!li) return;

            if (e.target.closest("input[type='checkbox']")) {
                const label = li.querySelector("label");
                label?.classList.toggle("checked", e.target.checked);
            }

            if (e.target.closest(".btn-delete-subtask")) {
                li.remove();
            }
        });
    },

    // 5. Task Form Submission and cancelling
    _handleTaskForm() {
        elements.formNewTask.form.addEventListener("submit", (e) => {
            e.preventDefault();
            const newTask = createNewTask();
            
            // Only refresh the list IF the new task is relevant to what I'm looking at
            if (this._shouldRenderInActiveTab(newTask)) {
                const activeTab = document.querySelector(".tab-list.active");
                Render.renderTasksByTabs(activeTab);
            }
            
            if (newTask.projectID) {
                this._syncProjectView(newTask.projectID);
            }

            this._refreshGlobalCounters();
            this._closeAndResetTaskForm();
        });

        elements.formNewTask.btnCancel.addEventListener("click", () => {
            Render.closeDialog(elements.formNewTask.dialog, Render.resetNewTaskDialog(allNewTaskInputs, elements.formNewTask.listSubtasks));
            Render.resetPrjOptions(elements.formNewTask.selectProject);
        });
    },

    _shouldRenderInActiveTab(newTask) {
        const activeTab = document.querySelector(".tab-list.active");
        const tabId = activeTab.dataset.id;

        if (tabId === "tab-all") return true;

        if (activeTab.classList.contains("project-tab")) {
            return newTask.projectID === tabId;
        }

        if (tabId === "tab-today") {
            return isToday(newTask);
        }

        if (tabId === "tab-upcoming") {
            return isFuture(newTask);
        }

        return false;
    },

    // 6. Sidebar & Theme buttons
    _handleGlobalUI() {
        // Sidebar Toggle
        elements.buttons.sidebar.addEventListener("click", () => 
            Render.toggleSidebar(elements.sidebar, elements.buttons.sidebar));

        // Theme Toggle
        elements.buttons.toggleTheme.addEventListener("click", () => 
            Render.toggleTheme(elements.buttons.toggleTheme));

        // Closing the Project Details dropdown if clicking outside
        document.addEventListener("click", (e) => this._handleOutsideClick(e));
    },

    _handleOutsideClick(e) {
        const clickedDetailsBtn = e.target.closest(".btn-details");
        const clickedInsideDetails = e.target.closest(".project .details");

        // Always hide all windows first
        document.querySelectorAll(".project .details").forEach(d => d.style.display = "none");

        // If a btn-details was clicked, re-open only its own details window
        if (clickedDetailsBtn && !clickedInsideDetails) {
            const detailsWindow = clickedDetailsBtn.nextElementSibling;
            detailsWindow.style.display = "flex";
        }
    },

    /* --- SHARED HELPERS --- */

    _syncProjectView(projectId) {
        const project = ProjectsStore.getById(projectId);
        const li = document.querySelector(`[data-id="${projectId}"]`);
        if (project && li) {
            // Keep only active tasks in the UI counter logic
            project.tasks = project.tasks.filter(t => !t.done);
            Render.updateTabPrj(li, project);
        }
    },

    _refreshGlobalCounters() {
        allTabs.forEach(tab => Render.renderCounters(tab));
    },

    _closeAndResetTaskForm() {
        Render.closeDialog(
            elements.formNewTask.dialog, 
            Render.resetNewTaskDialog(allNewTaskInputs, elements.formNewTask.listSubtasks)
        );
        Render.resetPrjOptions(elements.formNewTask.selectProject);
    },
};