import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { EraseEntityService } from './erase-entity.service';

describe('EraseEntityService', () => {
  let service: EraseEntityService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(EraseEntityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
