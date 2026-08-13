import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SetLightDarkModeService } from '@global/services/set-light-dark-mode-service/set-light-dark-mode.service';
import { SetUserThemeService } from '@global/services/set-user-theme-service/set-user-theme.service';

import { RoutingSpinnerListener } from '@global/listeners/routing-spinner-listener/routing-spinner.listener';
import { RoutingErrorsListener } from '@global/listeners/routing-errors-listener/routing-errors.listener';
import { CursorProgressSpinner } from '@global/components/cursor-progress-spinner/cursor-progress-spinner';
import { SetCursorProgressSpinnerService } from '@global/services/set-cursor-progress-spinner-service/set-cursor-progress-spinner.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RoutingSpinnerListener, RoutingErrorsListener, CursorProgressSpinner],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor(
    protected $setCursorProgressSpinnerService: SetCursorProgressSpinnerService,
    private $setUserThemeService: SetUserThemeService,
    private $setLightDarkModeService: SetLightDarkModeService,
  ) {
    try {
      this.$setLightDarkModeService.getStartColorScheme();
      this.$setUserThemeService.setUserTheme();
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        console.log(error.stack);
      }
    }
  }
}
