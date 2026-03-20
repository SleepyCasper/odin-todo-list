export class Task {
    #id;
    #dateAdded;

    constructor(title, desc, dueDate, priority, subtasks, project, projectID) {
        this.#id = crypto.randomUUID();
        this.#dateAdded = new Date();

        this.title = title;
        this.desc = desc;
        this.dueDate = dueDate instanceof Date ? dueDate : new Date(dueDate + "T00:00:00");
        this.priority = priority;
        if (subtasks) {
            this.subtasks = subtasks;
        } else {
            this.subtasks = null;
        }
        if(project === "no-project") {
            this.project = null;
            this.projectID = null;
        } else {
            this.project = project;
            this.projectID = projectID;
        }
        this.done = false;
    }

    toJSON() {
        return {
            id: this.#id,
            dateAdded: this.#dateAdded,
            title: this.title,
            desc: this.desc,
            dueDate: this.dueDate,
            priority: this.priority,
            subtasks: this.subtasks,
            project: this.project,
            projectID: this.projectID,
            done: this.done,
        };
    }

    get id() { return this.#id; }
} 