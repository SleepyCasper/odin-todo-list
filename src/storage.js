import { TasksStore } from "./tasksStore.js";
import { ProjectsStore } from "./projectsStore.js";

export const Storage = {
    saveTask(task) {
        localStorage.setItem(`tasks:${task.id}`, JSON.stringify(task));
    },

    deleteTask(task) {
        localStorage.removeItem(`tasks:${task.id}`);
    },

    saveProject(project) {
        localStorage.setItem(`projects:${project.id}`, JSON.stringify(project));
    },

    deleteProject(project) {
        localStorage.removeItem(`projects:${project.id}`);
    },

    importTasks() {
        Object.keys(localStorage)
            .filter(key => key.startsWith("tasks:"))
            .forEach(key => {
                const task = JSON.parse(localStorage.getItem(key));
                task.dueDate = new Date(task.dueDate);
                TasksStore.add(task);
            });
    },

    importProjects() {
        Object.keys(localStorage)
            .filter(key => key.startsWith("projects:"))
            .forEach(key => {
                const project = JSON.parse(localStorage.getItem(key));
                ProjectsStore.add(project);
            });
    }
}
