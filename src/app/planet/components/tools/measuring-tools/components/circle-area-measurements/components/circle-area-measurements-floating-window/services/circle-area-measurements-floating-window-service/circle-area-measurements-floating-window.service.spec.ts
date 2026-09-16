import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { CircleAreaMeasurementsFloatingWindowService } from './circle-area-measurements-floating-window.service';

describe('CircleAreaMeasurementsFloatingWindowService', () => {
  let service: CircleAreaMeasurementsFloatingWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(CircleAreaMeasurementsFloatingWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
