import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddMarkFloatingWindowService } from './add-mark-floating-window.service';

describe('AddMarkFloatingWindowService', () => {
  let service: AddMarkFloatingWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(AddMarkFloatingWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
