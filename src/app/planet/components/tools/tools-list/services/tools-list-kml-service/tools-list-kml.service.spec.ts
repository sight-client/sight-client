import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ToolsListKmlService } from './tools-list-kml.service';

describe('ToolsListKmlService', () => {
  let service: ToolsListKmlService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(ToolsListKmlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
