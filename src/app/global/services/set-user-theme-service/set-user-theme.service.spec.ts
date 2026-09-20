import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SetUserThemeService } from './set-user-theme.service';

describe('SetUserThemeService', () => {
  let service: SetUserThemeService;

  beforeEach(() => {
    localStorage.removeItem('themePalettes');
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(SetUserThemeService);
  });

  afterEach(() => {
    localStorage.removeItem('themePalettes');
    document.documentElement.className = '';
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('writes themePalettes and azure-blue-theme class on first setUserTheme', () => {
    localStorage.removeItem('themePalettes');
    service.setUserTheme();
    expect(localStorage.getItem('themePalettes')).toBeTruthy();
    expect(document.documentElement.classList.contains(`${service.nowUserPalettes()}-theme`)).toBe(
      true,
    );
  });

  it('setUserTheme(prev, next) swaps theme classes', () => {
    document.documentElement.classList.add('rose-red-theme');
    service.setUserTheme('rose-red', 'cyan-orange');
    expect(document.documentElement.classList.contains('cyan-orange-theme')).toBe(true);
    expect(document.documentElement.classList.contains('rose-red-theme')).toBe(false);
    expect(localStorage.getItem('themePalettes')).toBe('cyan-orange');
    expect(service.nowUserPalettes()).toBe('cyan-orange');
  });
});
