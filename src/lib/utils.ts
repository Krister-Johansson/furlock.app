import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DateTime } from 'luxon'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(dateStr: string): string {
  return DateTime.fromISO(dateStr).toLocaleString(DateTime.DATETIME_MED)
}
