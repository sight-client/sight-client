import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { CheckMobileDeviceService } from './check-mobile-device.service';

describe('CheckMobileDeviceService', () => {
  let service: CheckMobileDeviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(CheckMobileDeviceService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('checkMobile is true when userAgent matches iPhone', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      maxTouchPoints: 0,
    });
    expect(service.checkMobile()).toBe(true);
  });

  it('checkMobile is true when maxTouchPoints is greater than 0', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 2,
    });
    expect(service.checkMobile()).toBe(true);
  });
});
