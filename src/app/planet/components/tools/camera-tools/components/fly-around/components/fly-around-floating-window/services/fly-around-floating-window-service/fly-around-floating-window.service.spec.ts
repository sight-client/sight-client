import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { FlyAroundFloatingWindowService } from './fly-around-floating-window.service';

describe('FlyAroundFloatingWindowService', () => {
  let service: FlyAroundFloatingWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(FlyAroundFloatingWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
