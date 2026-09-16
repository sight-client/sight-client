import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddCircleService } from './add-circle.service';

describe('AddCircleService', () => {
  let service: AddCircleService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(AddCircleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
