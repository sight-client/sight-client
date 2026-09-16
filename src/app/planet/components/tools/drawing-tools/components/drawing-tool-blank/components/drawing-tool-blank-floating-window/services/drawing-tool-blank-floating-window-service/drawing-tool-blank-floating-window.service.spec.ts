import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { DrawingToolBlankFloatingWindowService } from './drawing-tool-blank-floating-window.service';

describe('DrawingToolBlankFloatingWindowService', () => {
  let service: DrawingToolBlankFloatingWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(DrawingToolBlankFloatingWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
