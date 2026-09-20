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

  it('addListener updates cursorXExport and cursorYExport on mousemove', () => {
    document.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 12, clientY: 34, bubbles: true }),
    );
    expect(service.cursorXExport).toBe(12);
    expect(service.cursorYExport).toBe(34);
  });
});
