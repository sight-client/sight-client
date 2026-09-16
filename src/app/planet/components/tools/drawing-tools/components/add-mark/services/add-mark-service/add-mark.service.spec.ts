import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddMarkService } from './add-mark.service';

describe('AddMarkService', () => {
  let service: AddMarkService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(AddMarkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
