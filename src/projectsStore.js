import { Storage } from "./storage";

export const ProjectsStore = {
    projects: [
    ],

    add(project) {
        this.projects.push(project);
        Storage.saveProject(project);
    },

    getAll() {
        return this.projects;
    },

    getById(id) {
        return this.projects.find(p => p.id === id);
    },

    update(id, changes) {
        const project = this.getById(id);
        if (project) Object.assign(project, changes);
        Storage.saveProject(project);
    },

    delete(project) {
        const index = this.projects.indexOf(project);
        this.projects.splice(index, 1);
        Storage.deleteProject(project);
    },

    deleteTask(project, task) {
        const index = project.tasks.indexOf(task);
        project.tasks.splice(index, 1);
        Storage.saveProject(project);
    }
}