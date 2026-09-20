import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SetProgressSpinnerService } from './set-progress-spinner.service';

describe('SetProgressSpinnerService', () => {
  let service: SetProgressSpinnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(SetProgressSpinnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
