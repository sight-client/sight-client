import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { CheckMobileDeviceService } from './check-mobile-device.service';

describe('CheckMobileDeviceService', () => {
  let service: CheckMobileDeviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(CheckMobileDeviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
