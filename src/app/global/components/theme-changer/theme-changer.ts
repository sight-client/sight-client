import { ChangeDetectionStrategy, Component, computed, Signal } from '@angular/core';

import { SetUserThemeService } from '@global/services/set-user-theme-service/set-user-theme.service';
import { LightDarkModeSwitcher } from './components/light-dark-mode-switcher/light-dark-mode-switcher';
import { ThemeColorChanger } from './components/theme-color-changer/theme-color-changer';

// Используется в:
// - planet.ts
// - landing-page.ts

@Component({
  selector: 'theme-changer',
  imports: [LightDarkModeSwitcher, ThemeColorChanger],
  template: `
    <div class="theme-changer-wrapper">
      @if (themesPalettesList().length) {
        <theme-color-changer />
      }
      <light-dark-mode-switcher />
    </div>
  `,
  styles: `
    .theme-changer-wrapper {
      position: absolute;
      z-index: 101;
      right: 15px;
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
export class ThemeChanger {
  protected themesPalettesList: Signal<string[] | undefined[]> = computed(() =>
    this.$setUserThemeService.themesPalettesListOnStart(),
  );
  constructor(private $setUserThemeService: SetUserThemeService) {}
}
