import { Injectable, signal } from '@angular/core';
import chalk from 'chalk';

// Используется в:
// - app.ts
// - theme-changer.ts и theme-color-changer.ts (переиспользование)

@Injectable({
  providedIn: 'root',
})
export class SetUserThemeService {
  constructor() {
    this.setUserTheme();
  }
  // variable from angular-material.config.scss
  readonly defaultThemePalettes: string | null = getComputedStyle(
    document.documentElement,
  ).getPropertyValue('--theme-palettes-default');

  readonly userThemePalettesOnStart: string = this.getUserThemePalettes(this.defaultThemePalettes);
  private getUserThemePalettes(defaultPalettes: string | null): string {
    try {
      let customPalettes: string | null = localStorage.getItem('themePalettes');
      if (!customPalettes || typeof customPalettes !== 'string') {
        if (defaultPalettes && typeof defaultPalettes === 'string') {
          customPalettes = defaultPalettes;
        } else {
          customPalettes = 'azure-blue';
        }
      }
      // Будет записано в root-css-переменную и в local storage внутри setUserTheme()
      return customPalettes;
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }

  // Запрашивается в theme-changer.ts и theme-color-changer.ts
  public themesPalettesListOnStart = signal<string[] | undefined[]>(this.getThemesPalettesList());
  private getThemesPalettesList(): string[] | undefined[] {
    try {
      // variable from angular-material.config.scss
      const cssThemeListVar: string | null = getComputedStyle(
        document.documentElement,
      ).getPropertyValue('--theme-palettes-list');
      if (!cssThemeListVar || typeof cssThemeListVar !== 'string') {
        console.log(
          chalk.blue('Список тем оформления пуст. Инструмент выбора тем оформления отключен'),
        );
        return [];
      }
      const themesArr: string[] = cssThemeListVar.split(' ');
      return themesArr;
    } catch (error: any) {
      console.log(
        chalk.blue(
          'Ошибка при определении тем оформления. Инструмент выбора тем оформления отключен',
        ),
      );
      console.log(chalk.red(error));
      return [];
    }
  }

  // Запрашивается в theme-color-changer.ts
  public nowUserPalettes = signal<string>('azure-blue');

  public setUserTheme(customPalettesPrev?: string, customPalettesNext?: string): void {
    try {
      // Условие для применения в theme-color-changer.ts (по кнопке)
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
        console.log(
          chalk.blue('Ошибка в конфигурации тем приложения, будет установлена тема "azure-blue'),
        );
      }
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }

  private setUserThemeCssRootVar(userPalettes: string): void {
    try {
      document.documentElement.style.setProperty('--theme-palettes', userPalettes);
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }

  private setLocalStorageTheme(userPalettes: string): void {
    try {
      localStorage.setItem('themePalettes', userPalettes);
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }
}
