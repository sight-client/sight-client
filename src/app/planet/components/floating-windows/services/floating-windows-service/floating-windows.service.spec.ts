import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { FloatingWindowsService } from './floating-windows.service';

describe('FloatingWindowsService', () => {
  let service: FloatingWindowsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(FloatingWindowsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
