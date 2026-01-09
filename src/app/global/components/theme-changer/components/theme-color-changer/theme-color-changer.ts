import { ChangeDetectionStrategy, Component, computed, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SetUserThemeService } from '@global/services/set-user-theme-service/set-user-theme.service';

@Component({
  selector: 'theme-color-changer',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button
      title="Сменить цветовую палитру"
      class="theme-color-changer-button"
      matButton="tonal"
      (click)="changeColorTheme()"
    >
      <mat-icon>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5c0-.39-.15-.74-.39-1.01c-.23-.26-.38-.61-.38-.99c0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5c0-4.42-4.03-8-9-8m-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9S8 9.67 8 10.5S7.33 12 6.5 12m3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8m5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8m3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5"
          />
        </svg>
      </mat-icon>
    </button>
  `,
  styles: `
    .theme-color-changer-button {
      padding: 0px;
      min-width: var(--regular-btn-size);
      width: var(--regular-btn-size);
      height: var(--regular-btn-size);
      border-radius: 6px;
      outline: 1px solid var(--theme-outline-color);
      mat-icon {
        padding: 0;
        margin: 0;
        width: 24px;
        height: 24px;
        svg {
          opacity: 0.8;
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeColorChanger {
  // Логика выбора конкретного нового набора палитр (в данном случае - определение индекса текущей)
  // оставлена кнопке по причине возможного расширеня функционала данного компонента (например, выбора из таблицы)
  readonly themesPalettesList: Signal<string[] | undefined[]> = computed(() =>
    this.$setUserThemeService.themesPalettesListOnStart(),
  );
  readonly nowThemePalettes: Signal<string> = computed(() =>
    this.$setUserThemeService.nowUserPalettes(),
  );
  // Функция на кнопке:
  protected changeColorTheme(
    themesList: string[] | undefined[] = this.themesPalettesList(),
    themePalettes: string = this.nowThemePalettes(),
  ) {
    try {
      const nowThemeIndex = this.getNowThemeIndex(themesList, themePalettes);
      if (nowThemeIndex === themesList.length - 1) {
        this.$setUserThemeService.setUserTheme(themesList[nowThemeIndex], themesList[0]);
      } else {
        this.$setUserThemeService.setUserTheme(
          themesList[nowThemeIndex],
          themesList[nowThemeIndex + 1],
        );
      }
    } catch (error: any) {
      if (!error.cause) error.cause = 'red';
      throw error;
    }
  }
  private getNowThemeIndex(themesList: string[] | undefined[], themePalettes: string): number {
    try {
      if (!themesList || !themesList.length) {
        throw new Error('Список тем оформления пуст!');
      }
      const userThemeIndex = themesList.findIndex((item) => item === themePalettes);
      if (userThemeIndex !== -1) {
        return userThemeIndex;
      } else {
        throw new Error('Ошибка в определении индекса темы в списке тем!');
      }
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }

  constructor(private $setUserThemeService: SetUserThemeService) {}
}
