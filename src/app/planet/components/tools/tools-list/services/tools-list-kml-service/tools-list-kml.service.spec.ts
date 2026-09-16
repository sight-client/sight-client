import { TestBed } from '@angular/core/testing';

import { ToolsListKmlService } from './tools-list-kml.service';

describe('ToolsListKmlService', () => {
  let service: ToolsListKmlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToolsListKmlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
