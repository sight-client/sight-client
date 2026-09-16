import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AddLineService } from './add-line.service';

describe('AddLineService', () => {
  let service: AddLineService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(AddLineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
