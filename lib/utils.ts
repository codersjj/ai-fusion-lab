import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function formatTimeAgo(value: number, divisor: number, unit: string): string {
  const amount = Math.round(Math.abs(value) / divisor);
  return `${amount} ${unit}${amount !== 1 ? "s" : ""} ago`;
}

export function getRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit | "auto" = "auto",
  isFewSeconds: boolean = true
) {
  if (unit !== "auto") {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    return rtf.format(value, unit);
  }

  const absValue = Math.abs(value);

  if (absValue < 60) {
    if (isFewSeconds) {
      return `a few seconds ago`;
    }
    return formatTimeAgo(value, 1, "second");
  } else if (absValue < 3600) {
    return formatTimeAgo(value, 60, "minute");
  } else if (absValue < 86400) {
    return formatTimeAgo(value, 3600, "hour");
  } else if (absValue < 2592000) {
    return formatTimeAgo(value, 86400, "day");
  } else if (absValue < 31536000) {
    return formatTimeAgo(value, 2592000, "month");
  } else {
    return formatTimeAgo(value, 31536000, "year");
  }
}
