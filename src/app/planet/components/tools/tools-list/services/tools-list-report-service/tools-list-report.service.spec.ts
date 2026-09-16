import { TestBed } from '@angular/core/testing';

import { ToolsListReportService } from './tools-list-report.service';

describe('ToolsListReportService', () => {
  let service: ToolsListReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToolsListReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
