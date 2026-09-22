import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { CheckMobileDeviceService } from './check-mobile-device.service';

function stubMatchMedia(matchesByQuery: Record<string, boolean>): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: !!matchesByQuery[query],
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  }));
}

describe('CheckMobileDeviceService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function createService(): CheckMobileDeviceService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    return TestBed.inject(CheckMobileDeviceService);
  }

  it('checkMobile is true when userAgent matches iPhone', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      maxTouchPoints: 0,
    });
    stubMatchMedia({});
    expect(createService().checkMobile()).toBe(true);
  });

  it('checkMobile is false when desktop UA has maxTouchPoints', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 2,
    });
    stubMatchMedia({});
    const service = createService();
    expect(service.checkMobile()).toBe(false);
    expect(service.isMobile).toBe(false);
  });

  it('tabletLayout follows max-width 767px matchMedia, not UA', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 0,
    });
    stubMatchMedia({ '(max-width: 767px)': true, '(max-width: 582px)': false });
    const service = createService();
    expect(service.isMobile).toBe(false);
    expect(service.tabletLayout()).toBe(true);
    expect(service.phoneLayout()).toBe(false);
  });

  it('phoneLayout follows max-width 582px matchMedia, not UA', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 0,
    });
    stubMatchMedia({ '(max-width: 582px)': true });
    const service = createService();
    expect(service.isMobile).toBe(false);
    expect(service.phoneLayout()).toBe(true);
  });

  it('constructs without matchMedia; phoneLayout stays false', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 0,
    });
    const service = createService();
    expect(service).toBeTruthy();
    expect(service.phoneLayout()).toBe(false);
  });

  it('narrowChromeLayout follows max-width 1660px', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 0,
    });
    stubMatchMedia({ '(max-width: 1660px)': true, '(max-width: 1080px)': true });
    const service = createService();
    expect(service.isMobile).toBe(false);
    expect(service.narrowChromeLayout()).toBe(true);
    expect(service.laptopLayout()).toBe(true);
  });
});
