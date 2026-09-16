import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { RectangleAreaMeasurementsFloatingWindowService } from './rectangle-area-measurements-floating-window.service';

describe('RectangleAreaMeasurementsFloatingWindowService', () => {
  let service: RectangleAreaMeasurementsFloatingWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(RectangleAreaMeasurementsFloatingWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
