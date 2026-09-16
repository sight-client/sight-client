import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddLineFloatingWindowService } from './add-line-floating-window.service';

describe('AddLineFloatingWindowService', () => {
  let service: AddLineFloatingWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(AddLineFloatingWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
