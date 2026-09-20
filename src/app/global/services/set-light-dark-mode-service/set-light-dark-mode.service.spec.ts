import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SetLightDarkModeService } from './set-light-dark-mode.service';

describe('SetLightDarkModeService', () => {
  let service: SetLightDarkModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(SetLightDarkModeService);
  });

  afterEach(() => {
    localStorage.removeItem('colorScheme');
    document.documentElement.classList.remove('light-mode', 'dark-mode');
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('uses stored light colorScheme without rewriting from prefers-color-scheme', () => {
    localStorage.setItem('colorScheme', 'light');
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    });

    expect(service.getStartColorScheme()).toBe(false);
    expect(document.documentElement.classList.contains('light-mode')).toBe(true);
    expect(localStorage.getItem('colorScheme')).toBe('light');
  });

  it('setColorScheme(true) writes dark-mode class and colorScheme=dark', () => {
    service.setColorScheme(true);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    expect(document.documentElement.classList.contains('light-mode')).toBe(false);
    expect(localStorage.getItem('colorScheme')).toBe('dark');
    expect(service.isDarkChecked()).toBe(true);
  });
});
