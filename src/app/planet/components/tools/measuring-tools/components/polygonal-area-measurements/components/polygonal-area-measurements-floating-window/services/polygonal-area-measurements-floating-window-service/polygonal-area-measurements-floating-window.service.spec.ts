import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { PolygonalAreaMeasurementsFloatingWindowService } from './polygonal-area-measurements-floating-window.service';

describe('PolygonalAreaMeasurementsFloatingWindowService', () => {
  let service: PolygonalAreaMeasurementsFloatingWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(PolygonalAreaMeasurementsFloatingWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
