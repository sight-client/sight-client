import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { LinearMeasurementsFloatingWindowService } from './linear-measurements-floating-window.service';

describe('LinearMeasurementsFloatingWindowService', () => {
  let service: LinearMeasurementsFloatingWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(LinearMeasurementsFloatingWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
