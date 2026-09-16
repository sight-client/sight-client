import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { DrawingService } from './drawing.service';

describe('DrawingService', () => {
  let service: DrawingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(DrawingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
