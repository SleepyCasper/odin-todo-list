import { Project } from "./prjConstructor";

export const ProjectsStore = {
    projects: [
    ],

    add(project) {
        this.projects.push(project);
    },

    getProjects() {
        return this.projects;
    },

    getById(id) {
        return this.projects.find(p => p.id === id);
    },

    update(id, changes) {
        const project = this.getById(id);
        if (project) Object.assign(project, changes);
    }
}