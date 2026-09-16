import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { DrawingToolBlankService } from './drawing-tool-blank.service';

describe('DrawingToolBlankService', () => {
  let service: DrawingToolBlankService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(DrawingToolBlankService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
