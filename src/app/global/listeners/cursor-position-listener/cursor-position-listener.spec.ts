import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { CursorPositionListener } from './cursor-position-listener';

describe('CursorPositionListener', () => {
  let service: CursorPositionListener;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(CursorPositionListener);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
