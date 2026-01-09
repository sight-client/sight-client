import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { RoutingSpinnerListener } from '@global/listeners/routing-spinner-listener/routing-spinner.listener';
import { RoutingErrorsListener } from '@global/listeners/routing-errors-listener/routing-errors.listener';
import { CursorProgressSpiner } from '@global/components/cursor-progress-spiner/cursor-progress-spiner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RoutingSpinnerListener, RoutingErrorsListener, CursorProgressSpiner],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor() {}
}
