export class Project {
    #id;

    constructor(title, color, tasks, id) {
        this.title = title;
        if (typeof color === 'string') {
            this.color = color;
        } else { this.color = "black" };
        this.color = color;
        if (tasks) {
            this.tasks = tasks;
        } else { this.projects = null };
        if (tasks) {
            this.counter = tasks.length;
        } else { this.counter = null };
        if (id) {
            this.#id = id;
        } else {
            this.#id = crypto.randomUUID();
        }
    }

    get id() { return this.#id; };
}