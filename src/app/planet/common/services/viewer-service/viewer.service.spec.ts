import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ViewerService } from './viewer.service';

describe('ViewerService', () => {
  let service: ViewerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(ViewerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
