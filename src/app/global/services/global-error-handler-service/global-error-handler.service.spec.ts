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

  it('handleError with cause red logs and returns', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    service.handleError({ cause: 'red', stack: 's' });
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  it('handleError without cause still logs the error', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const err = { message: 'plain' };
    service.handleError(err);
    expect(log).toHaveBeenCalledWith(err);
    log.mockRestore();
  });
});
