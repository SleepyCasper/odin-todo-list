import { elements, allTabs, allNewTaskInputs, allNewPrjInputs } from "./elements";
import { Render } from "./render.js";
import { formatDateForInput, sort } from "./util.js";
import { createNewTask, createNewProject } from "./actions.js";
import { TasksStore } from "./tasksStore.js";
import { ProjectsStore } from "./projectsStore.js";
import { isToday, isFuture } from "date-fns";
import { Storage} from "./storage.js";

export const EventHandler = {
    editingProjectId: null,
    editingTaskId: null,
    sortState: "date",
    sortOrder: "ascending",
    filterState: "all",
    subValue: "all",

    init() {
        this._handleSidebar();
        this._handleSort();
        this._handleFilter();
        this._handleProjectActions();
        this._handleProjectDelete();
        this._handleProjectForm();
        this._handleTaskActions();
        this._handleTaskForm();
        this._handleDeleteTask();
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
                sort(this.sortState, this.sortOrder);
                Render.renderTasksByTabs(tabItem, this.filterState, this.subValue);
            }
        });
    },

    // Sorting tasks
    _handleSort() {
        // Change sort type
        elements.sort.select.addEventListener("change", (e) => {
            switch (e.target.value) {
                case "date":
                    this.sortState = "date";
                   break;
                case "name":
                    this.sortState = "name";
                    break;
                case "priority":
                    this.sortState = "priority";
                    break;
            }

            sort(this.sortState, this.sortOrder);
            // rerender tasks by tab
            const activeTab = document.querySelector(".tab-list.active");
            Render.renderTasksByTabs(activeTab, this.filterState, this.subValue);
        })

        // Change sort order
        elements.buttons.sortOrder.addEventListener("click", () => {
            const activeTab = document.querySelector(".tab-list.active");

            elements.buttons.sortOrder.classList.toggle("descending");
            this.sortOrder = this.sortOrder === "descending" ? "ascending" : "descending";

            sort(this.sortState, this.sortOrder);
            Render.renderTasksByTabs(activeTab, this.filterState, this.subValue);
        })
    },

    _handleFilter() {
        elements.filter.select.addEventListener("change", (e) => {
            switch (e.target.value) {
                case "all":
                    this.filterState = "all";
                    Render.resetFilterSubselect();
                    break;
                case "project":
                    this.filterState = "project";
                    Render.renderFilterSubselect("project");
                    break;
                case "priority":
                    this.filterState = "priority";

                    Render.renderFilterSubselect("priority");
                    break;
            }

            this.subValue = "all";
            elements.filter.subSelect.value = "all";

            // Rerender tasks
            const activeTab = document.querySelector(".tab-list.active");
            Render.renderTasksByTabs(activeTab, this.filterState, this.subValue);
        });

        elements.filter.subSelect.addEventListener("change", () => {
            this.subValue = elements.filter.subSelect.value;
            const activeTab = document.querySelector(".tab-list.active");
            Render.renderTasksByTabs(activeTab, this.filterState, this.subValue);
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
            const projectId = target.closest("[data-id]").dataset.id;
            const project = ProjectsStore.getById(projectId);
            
            // Edit
            if (target.closest(".btn-edit")) {
                this._setupProjectEdit(projectId);
            }
            
            // Delete
            if (target.closest(".btn-delete")) {
                this.editingProjectId = projectId;
                elements.deleteProject.span.textContent = project.title;
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
            elements.formNewProject.heading.textContent = "Edit project";
            elements.formNewProject.inputTitle.value = project.title;
            elements.formNewProject.btnCreate.textContent = "Update";

            elements.formNewProject.inputColorHidden.value = project.color;

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
    },

    _processProjectUpdate() {
        const formData = new FormData(elements.formNewProject.form);
        const id = this.editingProjectId;
        const oldTitle = ProjectsStore.getById(this.editingProjectId).title;

        ProjectsStore.update(id, {
            title: formData.get("title"),
            color: formData.get("project-color"),
        });
        

        //Update project name in tasks
        const tasks = TasksStore.getByPrjID(id);
        tasks.forEach(task => {
            TasksStore.update(task.id, {project: formData.get("title")});
        })

        // Re-render tasks
        Render.rerenderTasksOnProjectUpdate(oldTitle, ProjectsStore.getById(this.editingProjectId));
        
        //Re-render li
        const li = document.querySelector(`[data-id="${id}"]`);
        Render.updateTabPrj(li, ProjectsStore.getById(id));
    },

    _processProjectCreate() {
        const newPrj = createNewProject();
        Render.renderTabPrj(newPrj);
    },

    _closeAndResetProjectForm() {
        this.editingProjectId = null; // Clear the state
        elements.formNewProject.heading.textContent = "New project";
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
            Render.renderTasksByTabs(elements.tabs.allTasks, this.filterState, this.subValue);
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
            const btnEdit = e.target.closest(".btn-edit");
            const btnDelete = e.target.closest(".btn-delete");
            const checklist = e.target.closest(".checklist");

            if (checklist) {
                checklist.classList.toggle("active");
                this._handleSubtasks(e);
            }

            // Complete task
            if (checkbox) {
                this._completeTask(checkbox);
            }

            // Edit task
            if (btnEdit) {
                this._setupTaskEdit(e);
            }
            
            // Delete task
            if (btnDelete) {
                const task = TasksStore.getById(btnDelete.closest(".task").id);
                this.editingTaskId = task.id;
                elements.deleteTask.dialog.showModal();
            }
        });
    },

    async _completeTask(checkbox) {
        const taskCard = checkbox.closest(".task");
        const taskObj = TasksStore.getById(taskCard.id);

        const newDoneState = !taskObj.done;
        TasksStore.update(taskObj.id, { done: newDoneState });

        if (newDoneState) {
            // Completing
            taskCard.classList.add("deleting");

            await new Promise(res => {
                taskCard.addEventListener("transitionend", (e) => {
                    if (e.propertyName === "height") res();
                });
            });
        } else {
            // Undoing:
            taskCard.classList.remove("completed");
        }
        taskCard.remove();

        if (taskObj.projectID) {
            this._syncProjectView(taskObj.projectID);
        }

        this._refreshGlobalCounters();
    },

    _handleSubtasks(e) {
        const taskCard = e.target.closest(".task");
        if (!taskCard) return;

        const task = TasksStore.getById(taskCard.id);
        const domSubtasks = taskCard.querySelector(".subtasks");
        const subtasks = task.subtasks;
        this.editingTaskId = task.id;

        domSubtasks.classList.toggle("expanded");
        Render.renderSubtasksInCard(domSubtasks, subtasks);

        domSubtasks.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
            // Disable checkboxes if task is done
            if (task.done) {
                checkbox.disabled = true;
                return;
            }

            checkbox.addEventListener("change", () => {
                const li = checkbox.closest("li");
                const label = li.querySelector("label");
                const subtask = TasksStore.getSubtaskById(checkbox.id)
                
                label.classList.toggle("checked");
                
                if(checkbox.checked) {
                    subtask.done = true;
                } else { subtask.done = false };

                Storage.saveTask(task);
                Render.updateSubtaskChecklist(taskCard, task);
            })
        })

        this.editingTaskId = null;
    },

    _setupTaskEdit (e) {
        const task = TasksStore.getById(e.target.closest(".task").id);
        this.editingTaskId = task.id;
        if (!task) return;

        elements.formNewTask.heading.textContent = "Edit task";
        // Catch values of existing task
        elements.formNewTask.inputTitle.value = task.title;
        elements.formNewTask.inputDesc.value = task.desc;
        elements.formNewTask.inputDate.value = formatDateForInput(task);


        // Populate projects before setting value
        Render.renderPrjOptions(elements.formNewTask.selectProject);

        // Finding project option
        elements.formNewTask.selectProject.value = task.project === null ? "no-project" : task.project;
        elements.formNewTask.selectPriority.value = task.priority;

        // Subtasks
        elements.formNewTask.listSubtasks.innerHTML = "";
        Render.renderExistingSubtaskList(task);
        
        elements.formNewTask.btnCreate.textContent = "Update";
        elements.formNewTask.dialog.showModal();
    },

    _handleDeleteTask() {
        elements.deleteTask.btnDelete.addEventListener("click", () => {
            const task = TasksStore.getById(this.editingTaskId);
            const taskCard = document.getElementById(this.editingTaskId);
            const project = ProjectsStore.getById(task.projectID);

            TasksStore.delete(task);
            ProjectsStore.deleteTask(project, task);
            taskCard.remove();
            this._refreshGlobalCounters(project, task);

            elements.deleteTask.dialog.close();
            this.editingTaskId = null;
        });

        elements.deleteTask.btnCancel.addEventListener("click", () => {
            elements.deleteTask.dialog.close();
            this.editingTaskId = null;
        });
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
            let task;

            if (this.editingTaskId) {
                // 1. UPDATE EXISTING DATA
                this._processTaskUpdate();
                task = TasksStore.getById(this.editingTaskId);
            } else {
                // 2. CREATE NEW DATA
                task = createNewTask();
            }

            const isRelevant = this._shouldRenderInActiveTab(task);
            // Only refresh the list IF the new task is relevant to what I'm looking at
            if (this.editingTaskId || isRelevant) {
                const activeTab = document.querySelector(".tab-list.active");
                sort(this.sortState, this.sortOrder);
                Render.renderTasksByTabs(activeTab, this.filterState, this.subValue);
            }
            
            // Sync new project
            if (task.projectID) {
                this._syncProjectView(task.projectID);
            }

            this._closeAndResetTaskForm();
            this._refreshGlobalCounters();
            this.editingTaskId = null;
        });

        elements.formNewTask.btnCancel.addEventListener("click", () => {
            Render.closeDialog(elements.formNewTask.dialog, Render.resetNewTaskDialog(allNewTaskInputs, elements.formNewTask.listSubtasks));
            Render.resetPrjOptions(elements.formNewTask.selectProject);
            this.editingTaskId = null;
        });
    },

    _shouldRenderInActiveTab(newTask) {
        const activeTab = document.querySelector(".tab-list.active");
        const tabId = activeTab.dataset.id;

        if (tabId === "tab-all") return true;

        if (activeTab.classList.contains("project")) {
            return newTask.projectID === tabId;
        }

        if (tabId === "tab-today") {
            return isToday(newTask.dueDate);
        }

        if (tabId === "tab-upcoming") {
            return isFuture(newTask.dueDate);
        }

        return false;
    },

    _processTaskUpdate() {
        const formData = new FormData(elements.formNewTask.form);

        // Gather subtasks from the DOM (since they might have changed)
        const subtasks = [];
        elements.formNewTask.listSubtasks.querySelectorAll("li").forEach(li => {
            subtasks.push({
                id: li.querySelector("input").id,
                text: li.querySelector("label").textContent,
                done: li.querySelector("input").checked
            });
        });

         const projectID = elements.formNewTask.selectProject.selectedOptions[0]?.dataset.id ?? null;
         const projectValue = formData.get("project");
        // Update the Store
        TasksStore.update(this.editingTaskId, {
            title: formData.get("title"), // Ensure your input name="title"
            desc: formData.get("desc"),
            dueDate: formData.get("date"),
            priority: formData.get("priority"),
            project: projectValue === "no-project" ? null : projectValue,
            projectID: projectID === "no-project" ? null : projectID,
            subtasks: subtasks
        });
    },

    // 6. Sidebar & Theme buttons
    _handleGlobalUI() {
        // Sidebar Toggle
        elements.buttons.sidebar.addEventListener("click", () => 
            Render.toggleSidebar(elements.sidebar, elements.buttons.sidebar));

        // Theme Toggle
        elements.buttons.toggleTheme.addEventListener("click", (e) => {
            Render.toggleTheme(e.target);
        })

        // Calling sort and filter
        elements.buttons.sort.addEventListener("click", (e) => Render.renderSortFilter(e.target));
        elements.buttons.filter.addEventListener("click", (e) => Render.renderSortFilter(e.target));

        // Closing the Project Details dropdown if clicking outside
        document.addEventListener("click", (e) => this._handleOutsideClick(e));
    },

    _handleOutsideClick(e) {
        const toggleMap = [
            {
                btnSelector: ".btn-details",
                windowSelector: ".project .details",
                getWindow: (btn) => btn.nextElementSibling,
            },
            {
                btnSelector: "#btn-sort",
                windowSelector: "#sort",
                getWindow: () => document.getElementById("sort"),
            },
            {
                btnSelector: "#btn-filter",
                windowSelector: "#filter",
                getWindow: () => document.getElementById("filter"),
            },
        ];

        toggleMap.forEach(({ btnSelector, windowSelector, getWindow }) => {
            const clickedBtn = e.target.closest(btnSelector);
            const clickedInsideWindow = e.target.closest(windowSelector);

            // Don't do anything if clicking inside the window
            if (clickedInsideWindow) return;

            // Always hide all windows of this type first
            document.querySelectorAll(windowSelector).forEach(w => w.style.display = "none");

            // Re-open only if the toggle button was clicked (and not inside the window itself)
            if (clickedBtn && !clickedInsideWindow) {
                getWindow(clickedBtn).style.display = "flex";
            }
        });
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
        const allTabs = document.querySelectorAll(".tab-list");
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