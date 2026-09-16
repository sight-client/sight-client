import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { FlyAroundService } from './fly-around.service';

describe('FlyAroundService', () => {
  let service: FlyAroundService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(FlyAroundService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
