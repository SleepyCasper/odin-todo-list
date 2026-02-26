export const ProjectsStore = {
    projects: [],

    add(project) {
        this.projects.push(project);
    },

    getProjects() {
        return this.projects;
    }
}