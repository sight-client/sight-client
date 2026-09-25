import { isObjectLike } from 'lodash';

export function getMomentName(startsWith?: string, extention?: string): string {
  const localDate = new Date();
  const timeZoneOffset = localDate.getTimezoneOffset();
  /* Необходима, т.к. .toISOString() работает только с UTC+0 */
  const utcDate = new Date(localDate.getTime() - timeZoneOffset * 60 * 1000);
  const trueTodayDate = utcDate.toISOString().split('T')[0];
  const time = localDate.toLocaleTimeString('it-IT');
  return `${startsWith ? startsWith + '-' : ''}${trueTodayDate}-${time}${extention ? '.sight.' + extention : ''}`;
}

export function getMomentDate(): string {
  const localDate = new Date();
  const timeZoneOffset = localDate.getTimezoneOffset();
  /* Необходима, т.к. .toISOString() работает только с UTC+0 */
  const utcDate = new Date(localDate.getTime() - timeZoneOffset * 60 * 1000);
  const trueTodayDate = utcDate.toISOString().split('T')[0];
  const trueTodayDateWithDots = trueTodayDate.replaceAll('-', '.');
  return `${trueTodayDateWithDots}`;
}

export function downloadBlob(filename: string, blobData: Blob | MediaSource): void {
  const url = window.URL.createObjectURL(blobData);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export function uploadBlob(event: Event): File {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || !input.files?.length) {
    throw new Error('No imported data from input event');
  }
  return input.files[0];
}

export function finiteCssPx(value: string, fallback = 0): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isKeyedObject(value: unknown): value is Record<string, unknown> {
  return isObjectLike(value);
}

export function jsonNullToUndefined<T>(obj: T): T {
  if (obj === null) return undefined as T;
  if (obj === undefined) return obj;
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') return obj;
  if (isKeyedObject(obj)) {
    const record: Record<string, unknown> = obj;
    for (const key of Object.keys(record)) {
      const value = record[key];
      if (value === null) record[key] = undefined;
      else if (value !== undefined && isKeyedObject(value)) {
        record[key] = jsonNullToUndefined(value);
      }
    }
  }
  return obj;
}

export function undefinedToJsonNull<T>(obj: T): T {
  if (obj === null) return obj;
  if (obj === undefined) return null as T;
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') return obj;
  if (isKeyedObject(obj)) {
    const record: Record<string, unknown> = obj;
    for (const key of Object.keys(record)) {
      const value = record[key];
      if (value === undefined) record[key] = null;
      else if (value !== null && isKeyedObject(value)) {
        record[key] = undefinedToJsonNull(value);
      }
    }
  }
  return obj;
}
