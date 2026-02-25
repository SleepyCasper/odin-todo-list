export class Task {
    #id;
    #dateAdded;

    constructor(title, desc, dueDate, priority, subtasks, project) {
        this.#id = crypto.randomUUID();
        this.#dateAdded = new Date();

        this.title = title;
        this.desc = desc;
        this.dueDate = dueDate;
        this.priority = priority;
        if (subtasks) {
            this.subtasks = subtasks;
        } else {
            this.subtasks = null;
        }
        if(project) {
            this.project = project;
        }   else {
            this.project = null;
        }
    }

    get id() { return this.#id; }
} 