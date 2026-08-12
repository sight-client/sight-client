import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { MeasuringToolsModalsService } from './measuring-tools-modals.service';

describe('MeasuringToolsModalsService', () => {
  let service: MeasuringToolsModalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(MeasuringToolsModalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
