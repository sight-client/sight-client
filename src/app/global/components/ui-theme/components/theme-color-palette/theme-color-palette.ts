import { ChangeDetectionStrategy, Component, computed, Signal, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SetUserThemeService } from '@global/services/set-user-theme-service/set-user-theme.service';

@Component({
  selector: 'theme-color-palette',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    @if (themesPalettesList().length) {
      @if (inMenu) {
        <button class="main-menu-import-button">
          <mat-icon>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5c0-.39-.15-.74-.39-1.01c-.23-.26-.38-.61-.38-.99c0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5c0-4.42-4.03-8-9-8m-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9S8 9.67 8 10.5S7.33 12 6.5 12m3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8m5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8m3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5"
              />
            </svg>
          </mat-icon>
          <span>Сменить палитру</span>
        </button>
      } @else {
        <button
          class="theme-color-palette-button"
          matButton="tonal"
          (click)="changeColorTheme($event)"
          matTooltip="Палитра интерфейса"
          matTooltipShowDelay="1000"
        >
          <mat-icon>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5c0-.39-.15-.74-.39-1.01c-.23-.26-.38-.61-.38-.99c0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5c0-4.42-4.03-8-9-8m-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9S8 9.67 8 10.5S7.33 12 6.5 12m3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8m5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8m3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5"
              />
            </svg>
          </mat-icon>
        </button>
      }
    } @else {
      <button disabled class="main-menu-import-button">
        <mat-icon>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2M4 12c0-4.42 3.58-8 8-8c1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.9 7.9 0 0 1 4 12m8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.9 7.9 0 0 1 20 12c0 4.42-3.58 8-8 8"
            />
          </svg>
        </mat-icon>
        <span>Палитры отсутствуют</span>
      </button>
    }
  `,
  styles: `
    .theme-color-palette-button {
      padding: 0px;
      min-width: var(--regular-btn-size);
      width: var(--regular-btn-size);
      height: var(--regular-btn-size);
      border-radius: 6px;
      outline: 1px solid var(--theme-outline-color);
      mat-icon {
        padding: 0;
        margin: 0;
        width: var(--regular-btn-svg-size);
        height: var(--regular-btn-svg-size);
        svg {
          opacity: 0.8;
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeColorPalette {
  @Input() inMenu: boolean;
  // Логика выбора конкретного нового набора палитр (в данном случае - определение индекса текущей)
  // оставлена кнопке по причине возможного расширеня функционала данного компонента (например, выбора из таблицы)
  readonly themesPalettesList: Signal<string[] | undefined[]> = computed(() =>
    this.$setUserThemeService.themesPalettesListOnStart(),
  );
  readonly nowThemePalettes: Signal<string> = computed(() =>
    this.$setUserThemeService.nowUserPalettes(),
  );
  // Функция на кнопке:
  public changeColorTheme(
    event: Event,
    themesList: string[] | undefined[] = this.themesPalettesList(),
    themePalettes: string = this.nowThemePalettes(),
  ) {
    // if (inMenu) console.log(event); // события keydown.enter / keydown.space сюда не дойдут (останутся на mat-menu button)
    event.preventDefault();
      event.stopPropagation();
      const nowThemeIndex = this.getNowThemeIndex(themesList, themePalettes);
      if (nowThemeIndex === themesList.length - 1) {
        this.$setUserThemeService.setUserTheme(themesList[nowThemeIndex], themesList[0]);
      } else {
        this.$setUserThemeService.setUserTheme(
          themesList[nowThemeIndex],
          themesList[nowThemeIndex + 1],
        );
      }
  }
  private getNowThemeIndex(themesList: string[] | undefined[], themePalettes: string): number {
    if (!themesList || !themesList.length) {
        throw new Error('Список тем оформления пуст!');
      }
      const userThemeIndex = themesList.findIndex((item) => item === themePalettes);
      if (userThemeIndex !== -1) {
        return userThemeIndex;
      } else {
        throw new Error('Ошибка в определении индекса темы в списке тем!');
      }
  }

  constructor(private $setUserThemeService: SetUserThemeService) {}
}
