import { ChangeDetectionStrategy, Component, computed, Signal } from '@angular/core';

import { SetUserThemeService } from '@global/services/set-user-theme-service/set-user-theme.service';
import { LightDarkMode } from './components/light-dark-mode/light-dark-mode';
import { ThemeColorPalette } from './components/theme-color-palette/theme-color-palette';

// Используется в:
// - planet.ts
// - landing-page.ts

@Component({
  selector: 'ui-theme',
  imports: [LightDarkMode, ThemeColorPalette],
  template: `
    <div class="ui-theme-wrapper">
      <light-dark-mode />
      @if (themesPalettesList().length) {
        <theme-color-palette />
      }
    </div>
  `,
  styles: `
    .ui-theme-wrapper {
      position: absolute;
      z-index: 101;
      left: 15px;
      top: 15px;
      width: max-content;
      height: max-content;
      display: flex;
      gap: 5px;
      flex-flow: row wrap;
      justify-content: center;
      align-items: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTheme {
  protected themesPalettesList: Signal<string[] | undefined[]> = computed(() =>
    this.$setUserThemeService.themesPalettesListOnStart(),
  );
  constructor(private $setUserThemeService: SetUserThemeService) {}
}
