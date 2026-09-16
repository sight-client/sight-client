import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { CircleAreaMeasurementsService } from './circle-area-measurements.service';

describe('CircleAreaMeasurementsService', () => {
  let service: CircleAreaMeasurementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(CircleAreaMeasurementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
