import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { LinearMeasurementsService } from './linear-measurements.service';

describe('LinearMeasurementsService', () => {
  let service: LinearMeasurementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(LinearMeasurementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
