export class Task {
    #id;
    #dateAdded;

    constructor(title, desc, dueDate, priority, subtasks, project, projectID) {
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
        if(project === "no-project") {
            this.project = null;
            this.projectID = null;
        } else {
            this.project = project;
            this.projectID = projectID;
        }
    }

    get id() { return this.#id; }

    get subtasksLength() {
        return this.subtasks.length;
    }

    get subtasksDoneLength() {
        let doneSubtasks = this.subtasks.filter( subtask => subtask.done === true);
        return doneSubtasks.length;
    }
} 