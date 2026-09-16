import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddPolygonFloatingWindowService } from './add-polygon-floating-window.service';

describe('AddPolygonFloatingWindowService', () => {
  let service: AddPolygonFloatingWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(AddPolygonFloatingWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
