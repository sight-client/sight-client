import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddRectangleFloatingWindowService } from './add-rectangle-floating-window.service';

describe('AddRectangleFloatingWindowService', () => {
  let service: AddRectangleFloatingWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(AddRectangleFloatingWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
