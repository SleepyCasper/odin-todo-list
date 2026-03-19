import { elements, allTabs, allNewTaskInputs, allNewPrjInputs } from "./elements";
import { ProjectsStore } from "./projectsStore.js";
import { TasksStore } from "./tasksStore.js";
import { Task } from "./taskConstructor.js";
import { Project } from "./prjConstructor.js";

export function createNewProject() {
    const formPrjData = new FormData(elements.formNewProject.form);

    const newProject = new Project (
        formPrjData.get("title"),
        formPrjData.get("project-color"),
    );

    ProjectsStore.add(newProject);
    return newProject;
}

export function createNewTask() {
    const formData = new FormData(elements.formNewTask.form);

    const subtasks = [...elements.formNewTask.listSubtasks.querySelectorAll("li")]
        .map(li => ({
            text: li.querySelector("label").textContent,
            done: li.querySelector("input").checked,
            id: crypto.randomUUID(),
        }));
    
    const projectID = elements.formNewTask.selectProject.selectedOptions[0]?.dataset.id ?? null;

    const newTask = new Task(
        formData.get("title"),
        formData.get("desc"),
        formData.get("date"),
        formData.get("priority"),
        subtasks,
        formData.get("project"),
        projectID
    );
    
    const project = ProjectsStore.getById(projectID);
    if (project) project.tasks.push(newTask);

    TasksStore.add(newTask);
    console.log(TasksStore.getAll());
    console.log(ProjectsStore.getProjects());
    return newTask;
}