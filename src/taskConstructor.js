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

    get id() { return this.#id; }

    get subtasksLength() {
        return this.subtasks.length ?? 0;
    }

    get subtasksDoneLength() {
        return this.subtasks?.filter(s => s.done).length ?? 0;
    }
} 