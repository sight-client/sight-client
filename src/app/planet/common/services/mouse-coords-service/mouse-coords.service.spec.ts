import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { MouseCoordsService } from './mouse-coords.service';

describe('MouseCoordsService', () => {
  let service: MouseCoordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(MouseCoordsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
