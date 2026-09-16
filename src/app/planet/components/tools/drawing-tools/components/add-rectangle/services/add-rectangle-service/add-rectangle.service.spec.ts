import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddRectangleService } from './add-rectangle.service';

describe('AddRectangleService', () => {
  let service: AddRectangleService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(AddRectangleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
