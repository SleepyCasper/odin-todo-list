export const TasksStore = {
    tasks: [],

    add(task) {
        this.tasks.push(task);
    },

    getAll() {
        return this.tasks;
    },

    getById(id) {
        return this.tasks.find(task => task.id === id);
    },

    getByPrjID(prjID) {
        let tasks = [];
        return tasks = this.tasks.filter(task => task.projectID === prjID);
    },

    getSubtaskById(id) {
        for (const task of this.tasks) {
            const subtask = task.subtasks?.find(sub => sub.id === id);
            if (subtask) return subtask;
        }
        return null;
    },

    delete(task) {
        const index = this.tasks.indexOf(task);
        this.tasks.splice(index, 1);
    },

    update(id, changes) {
        const task = this.getById(id);
        if (task) Object.assign(task, changes);
    }
}