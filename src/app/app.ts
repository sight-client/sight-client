import { Component } from '@angular/core';
import { reportError } from '@global/lib/report-error.lib';
import { RouterOutlet } from '@angular/router';

import { SetLightDarkModeService } from '@global/services/set-light-dark-mode-service/set-light-dark-mode.service';
import { SetUserThemeService } from '@global/services/set-user-theme-service/set-user-theme.service';

import { RoutingSpinnerListener } from '@global/listeners/routing-spinner-listener/routing-spinner.listener';
import { RoutingErrorsListener } from '@global/listeners/routing-errors-listener/routing-errors.listener';
import { ProgressSpinner } from '@global/components/progress-spinner/progress-spinner';
import { SetProgressSpinnerService } from '@global/services/set-progress-spinner-service/set-progress-spinner.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RoutingSpinnerListener, RoutingErrorsListener, ProgressSpinner],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor(
    protected $setProgressSpinnerService: SetProgressSpinnerService,
    private $setUserThemeService: SetUserThemeService,
    private $setLightDarkModeService: SetLightDarkModeService,
  ) {
    try {
      this.$setLightDarkModeService.getStartColorScheme();
      this.$setUserThemeService.setUserTheme();
    } catch (error: unknown) {
      reportError(error);
    }
  }
}
