export const TasksStore = {
    tasks: [],

    add(task) {
        this.tasks.push(task);
    }
}