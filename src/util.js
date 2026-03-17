import { isToday, isFuture, isPast, format, isTomorrow, isWithinInterval, addDays } from "date-fns";
import { TasksStore } from "./tasksStore";
import { elements } from "./elements";
import { Render } from "./render";

export function capitalizeFirstLetter(string) {
  if (string.length === 0) {
    return string;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function uncapitalizeFirstLetter(string) {
  if (string.length === 0) {
    return string;
  }
  return string.charAt(0).toLowerCase() + string.slice(1);
}

export function formatDates(date) {
  if (isToday(date)) {
    return "Today";
  } else if (isTomorrow(date)) {
    return "Tomorrow";
  } else if (isWithinInterval(date, { start: new Date(), end: addDays(new Date(), 7) })) {
    return format(date, "cccc"); // e.g. "Monday"
  } else {
    return format(date, "d MMM"); // e.g. "15 Apr"
  }
}

export function formatDateForInput(task) {
  const dateString = new Date(task.dueDate).toISOString().split('T')[0];
  return dateString;
}

export function sort(action, order) {
  let tasks = TasksStore.getAll();
  let sorted;
  
  switch (action) {
    case "date":
      tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      console.log(tasks);
      break;
    case "name":
      tasks.sort((a, b) => a.title.localeCompare(b.title));
      console.log(tasks);
      break;
    case "priority":
      tasks.sort((a, b) => a.priority.localeCompare(b.priority));
      console.log(tasks);
      break;
  }

  if (order === "descending") {
    return sorted = tasks.reverse();
  } else {
    return tasks;
  }
}

export function filter(tasks, filterState, subValue) {
  switch (filterState) {
    case "all":
        return tasks;
    case "project":
        if (subValue === "all") {
            // Show all tasks that belong to ANY project
            tasks = tasks.filter(task => task.project !== null);
        } else {
            tasks = filterByProject(tasks, subValue);
        }
        break;
    case "priority":
        if (subValue === "all") {
            // "All" priority means no filtering needed
        } else {
            tasks = filterByPriority(tasks, subValue);
        }
        break;
  }

  return tasks;
}

function filterByProject (tasks, subValue) { //! not subvalue
  return tasks = tasks.filter(task => task.projectID === subValue);
}

function filterByPriority(tasks, filterValue) {
  return tasks = tasks.filter(task => task.priority === filterValue);
}
