import { isObjectLike } from 'lodash';

export function getMomentName(startsWith?: string, extention?: string): string {
  try {
    const localDate = new Date();
    const timeZoneOffset = localDate.getTimezoneOffset();
    /* Необходима, т.к. .toISOString() работает только с UTC+0 */
    const utcDate = new Date(localDate.getTime() - timeZoneOffset * 60 * 1000);
    const trueTodayDate = utcDate.toISOString().split('T')[0];
    const time = localDate.toLocaleTimeString('it-IT');
    return `${startsWith ? startsWith + '-' : ''}${trueTodayDate}-${time}${extention ? '.oko.' + extention : ''}`;
  } catch (error: unknown) {
    throw error;
  }
}

export function getMomentDate(): string {
  try {
    const localDate = new Date();
    const timeZoneOffset = localDate.getTimezoneOffset();
    /* Необходима, т.к. .toISOString() работает только с UTC+0 */
    const utcDate = new Date(localDate.getTime() - timeZoneOffset * 60 * 1000);
    const trueTodayDate = utcDate.toISOString().split('T')[0];
    const trueTodayDateWithDots = trueTodayDate.replaceAll('-', '.');
    return `${trueTodayDateWithDots}`;
  } catch (error: unknown) {
    throw error;
  }
}
// ------------------------------------------------------------------------------------ **
export function downloadBlob(filename: string, blobData: Blob | MediaSource): void {
  try {
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      // Для Internet Explorer
      (window.navigator as any).msSaveOrOpenBlob(blobData, filename);
    } else {
      // Для современных браузеров
      const url = window.URL.createObjectURL(blobData);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  } catch (error: unknown) {
    throw error;
  }
}
export function uploadBlob(event: Event): File {
  try {
    // onchange input (type="file") event
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) {
      throw new Error('No imported data from input event');
    }
    const file: File = input.files[0];
    return file;
  } catch (error: unknown) {
    throw error;
  }
}
// ------------------------------------------------------------------------------------ **
// Рекурсионный обход проблемы JSON-преобразований
export function jsonNullToUndefined(obj: any): any {
  try {
    if (obj === undefined) return obj;
    if (obj === null) {
      obj = undefined!;
      return obj;
    }
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }
    if (isObjectLike(obj)) {
      for (const key in obj) {
        if (obj[key] === null) {
          obj[key] = undefined;
        } else if ((obj[key] !== null && obj[key]) !== undefined && isObjectLike(obj[key])) {
          obj[key] = jsonNullToUndefined(obj[key]);
        }
      }
      return obj;
    }
    return null;
  } catch (error: unknown) {
    if (error instanceof Error) console.log(error.stack);
    throw error;
  }
}
export function undefinedToJsonNull(obj: any): any {
  try {
    if (obj === null) return obj;
    if (obj === undefined) {
      obj = null;
      return obj;
    }
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }
    if (isObjectLike(obj)) {
      for (const key in obj) {
        if (obj[key] === undefined) {
          obj[key] = null;
        } else if (obj[key] !== null && obj[key] !== undefined && isObjectLike(obj[key])) {
          // console.log(obj[key]);
          obj[key] = undefinedToJsonNull(obj[key]);
        }
      }
      return obj;
    }
    return null;
  } catch (error: unknown) {
    if (error instanceof Error) console.log(error.stack);
    throw error;
  }
}
// ------------------------------------------------------------------------------------ **
