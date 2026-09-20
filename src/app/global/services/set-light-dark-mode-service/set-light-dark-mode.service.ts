import { effect, Injectable, signal, untracked } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map, skip, startWith } from 'rxjs/operators';

// Используется в:
// - app.ts
// - light-dark-mode.ts (переиспользование)

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
    try {
      let isDarkMode: boolean = false;
      const userColorScheme: string | null = localStorage.getItem('colorScheme');
      // Самое первое значение (до записи в localStorage) берется из установок браузера
      const isSystemDarkScheme: boolean = window?.matchMedia(
        '(prefers-color-scheme: dark)',
      )?.matches; // не будет выдавать адекватное значение (всегда true), если тема установлена и в ОС (браузер не в приоритете)
      if (userColorScheme === 'light' || userColorScheme === 'dark') {
        userColorScheme === 'light' ? (isDarkMode = false) : (isDarkMode = true);
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
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }
  private setLight(): void {
    try {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('colorScheme', 'light');
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }
  private setDark(): void {
    try {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('colorScheme', 'dark');
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }
  // Функция на кнопке в компонентах-переключателях:
  public setColorScheme = (checked: boolean): void => {
    try {
      checked ? this.setDark() : this.setLight();
      this.isDarkChecked.set(checked);
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  };
  // Получение (пропускается через .pipe(skip(1))) и отслеживание системных настроек light-dark-режима оформления.
  // Приоритет - на состоянии приложения (последнего положения тоггла), но данная настройка существует для
  // альтернативного сценария смены light-dark-режима оформления через настройку UI браузера.
  // При этом происходит "мягкое" принуждение приложения к переключению на выбранный в данном случае режим:
  // результат пользователь увидит только после перезагрузки страницы - данные в localStorage (на которые ориентируется
  // положение тоггла) обновились и при загрузке будут считаны стандартным путем.

  private prefersColorScheme(): Observable<string> {
    try {
      if (typeof window === 'undefined' || !window.matchMedia) {
        return new Observable((subscriber) => {
          subscriber.unsubscribe();
        });
        // return new Observable((subscriber) => {
        //   subscriber.error(new Error('window.matchMedia is not available.'));
        // });
      }
      const mediaQueryListObj: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
      // Событие не отслеживается (не реагирует на переключение темы в настройках браузера), если тема выставлена в самой ОС
      return fromEvent<MediaQueryListEvent>(mediaQueryListObj, 'change').pipe(
        map((event: MediaQueryListEvent) => (event.matches ? 'dark' : 'light')),
        startWith(mediaQueryListObj.matches ? 'dark' : 'light'),
      );
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }
}
