import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SetCursorProgressSpinnerService } from './set-cursor-progress-spinner.service';

describe('SetCursorProgressSpinnerService', () => {
  let service: SetCursorProgressSpinnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(SetCursorProgressSpinnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
