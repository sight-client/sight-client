import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddPolygonService } from './add-polygon.service';

describe('AddPolygonService', () => {
  let service: AddPolygonService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(AddPolygonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
