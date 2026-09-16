import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddCircleFloatingWindowService } from './add-circle-floating-window.service';

describe('AddCircleFloatingWindowService', () => {
  let service: AddCircleFloatingWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(AddCircleFloatingWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
