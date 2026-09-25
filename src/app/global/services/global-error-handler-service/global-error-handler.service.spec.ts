import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { GlobalErrorHandlerService } from './global-error-handler.service';

describe('GlobalErrorHandlerService', () => {
  let service: GlobalErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), GlobalErrorHandlerService],
    });
    service = TestBed.inject(GlobalErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('logs the error with console.error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const err = { message: 'plain' };

    service.handleError(err);

    expect(errorSpy).toHaveBeenCalledWith(err);
    errorSpy.mockRestore();
  });

  it('logs a nested validation message', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    service.handleError({ error: { message: 'bad field' } });

    expect(errorSpy).toHaveBeenCalledWith('bad field');
    errorSpy.mockRestore();
  });
});
