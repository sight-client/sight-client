import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
  handleError(error: unknown): void {
    console.error(error);
    const validationMessage = readValidationMessage(error);
    if (validationMessage !== undefined) {
      console.error(validationMessage);
    }
  }
}

function readValidationMessage(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('error' in error)) {
    return undefined;
  }
  const body = error.error;
  if (typeof body !== 'object' || body === null || !('message' in body)) {
    return undefined;
  }
  return typeof body.message === 'string' ? body.message : undefined;
}
