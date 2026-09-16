import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ToolsListService } from './tools-list.service';

describe('ToolsListService', () => {
  let service: ToolsListService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(ToolsListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
