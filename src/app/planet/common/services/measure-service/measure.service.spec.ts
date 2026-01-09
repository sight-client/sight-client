import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { MeasureService } from './measure.service';

describe('MeasureService', () => {
  let service: MeasureService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(MeasureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
