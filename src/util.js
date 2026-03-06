import { isToday, isFuture, isPast, format, isTomorrow, isWithinInterval, addDays } from "date-fns";

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

// for today isToday()
// for overdue isPast()
// for upcoming isFuture()
// for formatting format()

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