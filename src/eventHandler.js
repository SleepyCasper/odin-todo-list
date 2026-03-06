import { elements, allTabs, allNewTaskInputs, allNewPrjInputs } from "./elements";
import { Render } from "./render.js";
import { createNewTask, createNewProject } from "./actions.js";
import { TasksStore } from "./tasksStore.js";
import { ProjectsStore } from "./projectsStore.js";

export const EventHandler = {
    init() {
        // Change active tabs in sidebar and render tasks
        document.querySelector(".sidebar").addEventListener("click", (e) => {
            const tabItem = e.target.closest(".tab-list");
            if (!tabItem) return;
            const allTabItems = document.querySelectorAll(".tab-list");
            allTabItems.forEach(el => el.classList.remove("active"));
            tabItem.classList.add("active");
            sessionStorage.setItem("activeTab", tabItem.dataset.id);
            Render.renderHeading(elements.heading);
            Render.renderTasksByTabs(tabItem);
        });

        // Details project button event listener:
        let editingProjectId = null;

        elements.tabProjects.addEventListener("click", (e) => {
            const detailsBtn = e.target.closest(".btn-details");
            if (!detailsBtn) return;
        
            const detailsWindow = detailsBtn.nextElementSibling;
            detailsWindow.style = "display: flex";
        })

        // Edit project button event listener:
        elements.tabProjects.addEventListener("click", (e) => {
            const editBtn = e.target.closest(".btn-edit");
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

        // Delete project button listener:
        elements.tabProjects.addEventListener("click", (e) => {
            const deleteBtn = e.target.closest(".btn-delete");
            if (!deleteBtn) return;
        
            const li = deleteBtn.closest("[data-id]");
            const projectId = li?.dataset.id;
        
            const project = ProjectsStore.getById(projectId);
            editingProjectId = project.id;
        
            //Calling delete dialog
            elements.deleteProject.dialog.showModal();
        })

        elements.deleteProject.btnCancel.addEventListener("click", () => 
            Render.closeDialog(elements.deleteProject.dialog));
            editingProjectId = null;

        elements.deleteProject.btnDelete.addEventListener("click", () => {
            const project = ProjectsStore.getById(editingProjectId);
            const tabPrj = document.querySelector(`[data-id="${editingProjectId}"]`);
            const tasks = TasksStore.getByPrjID(editingProjectId);
            tasks.forEach(task => TasksStore.delete(task)); // delete tasks of the project
            // rerender projects
            ProjectsStore.delete(project); // delete project
            tabPrj.remove(); // delete li element
            Render.closeDialog(elements.deleteProject.dialog);
            editingProjectId = null;
            console.log(ProjectsStore.getProjects());
            console.log(TasksStore.getAll());
        })

        // Close prj details dialog 
        document.addEventListener("click", (e) => {
            const clickedDetailsBtn = e.target.closest(".btn-details");
            const clickedInsideDetails = e.target.closest(".project .details");

            // Always hide all windows first
            document.querySelectorAll(".project .details").forEach(d => d.style.display = "none");

            // If a btn-details was clicked, re-open only its own details window
            if (clickedDetailsBtn && !clickedInsideDetails) {
                const detailsWindow = clickedDetailsBtn.nextElementSibling;
                detailsWindow.style.display = "flex";
            }
        })

        elements.buttons.sidebar.addEventListener("click", () => 
            Render.toggleSidebar(elements.sidebar, elements.buttons.sidebar));

        elements.buttons.toggleTheme.addEventListener("click", () => 
            Render.toggleTheme(elements.buttons.toggleTheme));

        // Show new task dialog
        elements.buttons.newTask.forEach(btn => {
            btn.addEventListener("click", () => {
                Render.renderPrjOptions(elements.formNewTask.selectProject);
                elements.formNewTask.dialog.showModal()
            });
        });

        // Show new project dialog
        elements.buttons.newProject.addEventListener("click", () => elements.formNewProject.dialog.showModal());

        // Completing tasks
        elements.tasks.addEventListener("click", (e) => {
            const checkbox = e.target.closest(".checkbox");
            if(!checkbox) {return};
            const taskCard = checkbox.closest(".task");
            const taskObj = TasksStore.getById(taskCard.id);

            taskCard.remove();
            TasksStore.update(taskObj.id, {done:true});

            if (taskObj.projectID) {
                const project = ProjectsStore.getById(taskObj.projectID);
                const li = document.querySelector(`[data-id="${taskObj.projectID}"]`);
                // ! probably needs reworking
                project.tasks = project.tasks.filter(t => t.id !== taskObj.id);
                Render.updateTabPrj(li, project);
            }
            // Re-render counters on tabs
            const tabs = document.querySelectorAll(".list-up > ul .tab-list");
            tabs.forEach(tab => {
                Render.renderCounters(tab);
            })
            console.log(TasksStore.getAll());
        })

        // NEW TASK DIALOG

        // Add subtasks
        elements.formNewTask.btnNewSubtask.addEventListener("click", () => {
            if(elements.formNewTask.inputSubtask.value) {
                Render.renderSubtaskList(elements.formNewTask.listSubtasks, elements.formNewTask.inputSubtask);
                elements.formNewTask.inputSubtask.value = "";
            } else {return}
        });

        // Check/delete subtasks
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

        // Submit task form and create new task
        elements.formNewTask.form.addEventListener("submit", (e) => {
            e.preventDefault();
            const newTask = createNewTask();
            Render.renderTask(newTask);
            allTabs.forEach(tab => Render.renderCounters(tab));
            Render.closeDialog(elements.formNewTask.dialog, Render.resetNewTaskDialog(allNewTaskInputs, elements.formNewTask.listSubtasks));
            Render.resetPrjOptions(elements.formNewTask.selectProject);
        
            const li = document.querySelector(`[data-id="${newTask.projectID}"]`)
            const project = ProjectsStore.getById(newTask.projectID);
        
            if (project) {
                Render.updateTabPrj(li, project);
            }
            console.log(TasksStore.tasks);
        });

        elements.formNewTask.btnCancel.addEventListener("click", () => {
            Render.closeDialog(elements.formNewTask.dialog, Render.resetNewTaskDialog(allNewTaskInputs, elements.formNewTask.listSubtasks));
            Render.resetPrjOptions(elements.formNewTask.selectProject);
        });


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
                const oldTitle = ProjectsStore.getById(editingProjectId).title;
                ProjectsStore.update(editingProjectId, {
                    title: formData.get("title"),
                    color: formData.get("project-color"),
                });
            
                const updatedProject = ProjectsStore.getById(editingProjectId);
            
                // Sync task objects in store
                TasksStore.tasks.forEach(task => {
                    if (task.project === oldTitle) task.project = updatedProject.title;
                });
            
                const li = document.querySelector(`[data-id="${editingProjectId}"]`);
                Render.updateTabPrj(li, ProjectsStore.getById(editingProjectId)); // re-render the li
                Render.rerenderTasksOnProjectUpdate(oldTitle, updatedProject); // re-render the task card
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
    }
    
}

function setColorValue(option) {
    elements.formNewProject.inputColorHidden.value = option.getAttribute("data-value");
    console.log(elements.formNewProject.inputColorHidden.value);
}