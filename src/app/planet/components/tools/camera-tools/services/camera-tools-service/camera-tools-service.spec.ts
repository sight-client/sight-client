import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { CameraToolsService } from './camera-tools.service';

describe('CameraToolsService', () => {
  let service: CameraToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(CameraToolsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
