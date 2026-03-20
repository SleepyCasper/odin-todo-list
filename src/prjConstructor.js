export class Project {
    #id;

    constructor(title, color, tasks, id) {
        this.title = title;
        this.color = color;
        this.tasks = tasks ?? [];
        if (id) {
            this.#id = id;
        } else {
            this.#id = crypto.randomUUID();
        }
    }

    toJSON() {
        return {
            id: this.#id,
            title: this.title,
            color: this.color,
            tasks: this.tasks,
        };
    }

    get counter() { return this.tasks ? this.tasks.length : 0; }

    get id() { return this.#id; };
}