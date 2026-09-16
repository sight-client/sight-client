import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { RectangleAreaMeasurementsService } from './rectangle-area-measurements.service';

describe('RectangleAreaMeasurementsService', () => {
  let service: RectangleAreaMeasurementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(RectangleAreaMeasurementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
