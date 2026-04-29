import { format, formatDistanceToNow, isPast, parseISO } from "date-fns";

export function formatEventDate(iso: string) {
  try {
    return format(parseISO(iso), "PPP p");
  } catch {
    return iso;
  }
}

export function formatRelative(iso: string) {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function eventHasEnded(iso: string) {
  try {
    return isPast(parseISO(iso));
  } catch {
    return false;
  }
}
