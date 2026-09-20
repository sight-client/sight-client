import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { SetLightDarkModeService } from '@global/services/set-light-dark-mode-service/set-light-dark-mode.service';
import { SetUserThemeService } from '@global/services/set-user-theme-service/set-user-theme.service';

describe('App', () => {
  it('should create the app', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('constructor calls theme start methods', async () => {
    const getStartColorScheme = vi.fn();
    const setUserTheme = vi.fn();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: SetLightDarkModeService, useValue: { getStartColorScheme } },
        { provide: SetUserThemeService, useValue: { setUserTheme } },
      ],
    }).compileComponents();
    TestBed.createComponent(App);
    expect(getStartColorScheme).toHaveBeenCalled();
    expect(setUserTheme).toHaveBeenCalled();
  });
});
