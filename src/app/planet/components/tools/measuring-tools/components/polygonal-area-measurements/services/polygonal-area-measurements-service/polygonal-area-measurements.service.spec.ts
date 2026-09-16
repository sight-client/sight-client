import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { PolygonalAreaMeasurementsService } from './polygonal-area-measurements.service';

describe('PolygonalAreaMeasurementsService', () => {
  let service: PolygonalAreaMeasurementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(PolygonalAreaMeasurementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
