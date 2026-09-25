import { reportError } from '@global/lib/report-error.lib';
import { Injectable, signal } from '@angular/core';

// Используется в:
// - app.ts
// - ui-theme.ts и theme-color-palette.ts (переиспользование)

@Injectable({
  providedIn: 'root',
})
export class SetUserThemeService {
  // constructor() {
  // this.setUserTheme(); // - в app.ts
  // }

  // variable from angular-material.config.scss
  readonly defaultThemePalettes: string | null = getComputedStyle(
    document.documentElement,
  ).getPropertyValue('--theme-palettes-default');

  readonly userThemePalettesOnStart: string = this.getUserThemePalettes(this.defaultThemePalettes);
  private getUserThemePalettes(defaultPalettes: string | null): string {
    let customPalettes: string | null = localStorage.getItem('themePalettes');
    if (typeof customPalettes === 'string') {
      customPalettes = customPalettes.trim();
    }
    if (!customPalettes) {
      if (typeof defaultPalettes === 'string' && defaultPalettes.trim() !== '') {
        customPalettes = defaultPalettes.trim();
      } else {
        customPalettes = 'azure-blue';
      }
    }
    return customPalettes;
  }

  // Запрашивается в ui-theme.ts и theme-color-palette.ts
  public themesPalettesListOnStart = signal<string[] | undefined[]>(this.getThemesPalettesList());
  private getThemesPalettesList(): string[] | undefined[] {
    try {
      // variable from angular-material.config.scss
      const cssThemeListVar: string | null = getComputedStyle(
        document.documentElement,
      ).getPropertyValue('--theme-palettes-list');
      if (!cssThemeListVar || typeof cssThemeListVar !== 'string') {
        console.info('Список тем оформления пуст. Инструмент выбора тем оформления отключен');
        return [];
      }
      const themesArr: string[] = cssThemeListVar
        .trim()
        .split(/\s+/)
        .filter((item) => item.length > 0);
      return themesArr;
    } catch (error: unknown) {
      console.info(
        'Ошибка при определении тем оформления. Инструмент выбора тем оформления отключен',
      );
      reportError(error);
      return [];
    }
  }

  // Запрашивается в theme-color-palette.ts
  public nowUserPalettes = signal<string>('azure-blue');

  public setUserTheme(customPalettesPrev?: string, customPalettesNext?: string): void {
    // Условие для применения в theme-color-palette.ts (по кнопке)
      if (
        customPalettesPrev !== undefined &&
        typeof customPalettesNext === 'string' &&
        customPalettesNext !== undefined &&
        typeof customPalettesNext === 'string'
      ) {
        this.setUserThemeCssRootVar(customPalettesNext);
        this.setLocalStorageTheme(customPalettesNext);
        this.nowUserPalettes.set(customPalettesNext);
        document.documentElement.classList.add(`${customPalettesNext}-theme`);
        document.documentElement.classList.remove(`${customPalettesPrev}-theme`);
        return;
      }
      // Условие для применения в app.ts (первичного, при !customPalettesPrev и !customPalettesNext)
      if (
        this.themesPalettesListOnStart().length &&
        this.themesPalettesListOnStart().find((item) => item === this.userThemePalettesOnStart)
      ) {
        // Применение стартовых значений
        this.setUserThemeCssRootVar(this.userThemePalettesOnStart);
        this.setLocalStorageTheme(this.userThemePalettesOnStart);
        this.nowUserPalettes.set(this.userThemePalettesOnStart);
        document.documentElement.classList.add(`${this.userThemePalettesOnStart}-theme`);
      } else {
        // Применение резервных значений
        this.setUserThemeCssRootVar('azure-blue');
        this.setLocalStorageTheme('azure-blue');
        this.nowUserPalettes.set('azure-blue');
        document.documentElement.classList.add(`${'azure-blue'}-theme`);
        console.info('Ошибка в конфигурации тем приложения, будет установлена тема "azure-blue');
      }
  }

  private setUserThemeCssRootVar(userPalettes: string): void {
    document.documentElement.style.setProperty('--theme-palettes', userPalettes);
  }

  private setLocalStorageTheme(userPalettes: string): void {
    localStorage.setItem('themePalettes', userPalettes);
  }
}
