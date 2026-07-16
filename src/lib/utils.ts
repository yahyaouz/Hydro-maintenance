import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLocalDateString(date?: Date): string {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLocalMonthString(date?: Date): string {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function escapeCsvField(value: any): string {
  if (value === null || value === undefined) {
    return '""';
  }
  let str = String(value);
  // Double internal double quotes
  str = str.replace(/"/g, '""');
  // Prevent CSV Injection/Formula injection
  if (/^[=\+\-@]/.test(str)) {
    str = "'" + str;
  }
  return `"${str}"`;
}
