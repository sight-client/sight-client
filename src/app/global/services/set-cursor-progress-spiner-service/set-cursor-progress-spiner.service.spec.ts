import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SetCursorProgressSpinerService } from './set-cursor-progress-spiner.service';

describe('SetCursorProgressSpinerService', () => {
  let service: SetCursorProgressSpinerService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(SetCursorProgressSpinerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
