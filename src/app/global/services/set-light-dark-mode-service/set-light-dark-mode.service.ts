import { effect, Injectable, signal, untracked } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map, skip, startWith } from 'rxjs/operators';

// Используется в:
// - app.ts
// - light-dark-mode.ts (переиспользование)

export const colorSchemeLiterals = Object.freeze(['light', 'dark'] as const);
export type ColorScheme = (typeof colorSchemeLiterals)[number];

export function isColorScheme(value: string): value is ColorScheme {
  return colorSchemeLiterals.some((scheme) => scheme === value);
}

@Injectable({
  providedIn: 'root',
})
export class SetLightDarkModeService {
  constructor() {
    // this.getStartColorScheme(); // - в app.ts
    effect(() => {
      if (this.isDarkChecked() === true) {
        document.documentElement.style.setProperty('--theme-outline-color', 'none');
      } else if (this.isDarkChecked() === false) {
        document.documentElement.style.setProperty(
          '--theme-outline-color',
          'var(--mat-sys-outline)',
        );
      }
    });
    untracked(() => {
      this.prefersColorScheme()
        .pipe(skip(1))
        .subscribe((scheme) => {
          localStorage.setItem('colorScheme', scheme);
        });
    });
  }
  // Отслеживается в компонентах-переключателях (независимо от local storage)
  public isDarkChecked = signal<boolean>(true);
  // Начальные установки для переключателей и local storage (в app.ts)
  public getStartColorScheme(): boolean {
    let isDarkMode: boolean = false;
      const userColorScheme = localStorage.getItem('colorScheme');
      const isSystemDarkScheme: boolean = window?.matchMedia(
        '(prefers-color-scheme: dark)',
      )?.matches;
      if (userColorScheme !== null && isColorScheme(userColorScheme)) {
        isDarkMode = userColorScheme === 'dark';
      } else {
        if (isSystemDarkScheme === true) {
          localStorage.setItem('colorScheme', 'dark');
        } else if (isSystemDarkScheme === false || isSystemDarkScheme === undefined) {
          localStorage.setItem('colorScheme', 'light');
        }
        isDarkMode = isSystemDarkScheme === undefined ? false : isSystemDarkScheme;
      }
      isDarkMode ? this.setDark() : this.setLight();
      this.isDarkChecked.set(isDarkMode);
      return isDarkMode;
  }
  private setLight(): void {
    document.documentElement.classList.add('light-mode');
    document.documentElement.classList.remove('dark-mode');
    localStorage.setItem('colorScheme', 'light');
  }
  private setDark(): void {
    document.documentElement.classList.add('dark-mode');
    document.documentElement.classList.remove('light-mode');
    localStorage.setItem('colorScheme', 'dark');
  }
  // Функция на кнопке в компонентах-переключателях:
  public setColorScheme = (checked: boolean): void => {
    checked ? this.setDark() : this.setLight();
    this.isDarkChecked.set(checked);
  };
  // Получение (пропускается через .pipe(skip(1))) и отслеживание системных настроек light-dark-режима оформления.
  // Приоритет - на состоянии приложения (последнего положения тоггла), но данная настройка существует для
  // альтернативного сценария смены light-dark-режима оформления через настройку UI браузера.
  // При этом происходит "мягкое" принуждение приложения к переключению на выбранный в данном случае режим:
  // результат пользователь увидит только после перезагрузки страницы - данные в localStorage (на которые ориентируется
  // положение тоггла) обновились и при загрузке будут считаны стандартным путем.

  private prefersColorScheme(): Observable<ColorScheme> {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return new Observable<ColorScheme>((subscriber) => {
        subscriber.unsubscribe();
      });
    }
    const mediaQueryListObj: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    return fromEvent<MediaQueryListEvent>(mediaQueryListObj, 'change').pipe(
      map((event: MediaQueryListEvent): ColorScheme => (event.matches ? 'dark' : 'light')),
      startWith<ColorScheme>(mediaQueryListObj.matches ? 'dark' : 'light'),
    );
  }
}
