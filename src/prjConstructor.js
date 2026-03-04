export class Project {
    #id;

    constructor(title, color, tasks, id) {
        this.title = title;
        this.color = color;
        if (tasks) {
            this.tasks = tasks ?? [];
            this.counter = this.tasks.length;
        } else { this.tasks = null;
                this.counter = null;
            } ;
        if (id) {
            this.#id = id;
        } else {
            this.#id = crypto.randomUUID();
        }
    }

    get id() { return this.#id; };
}