import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  // RouterOutlet,
  RouterLink,
  // RouterLinkActive
} from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { UiTheme } from '@global/components/ui-theme/ui-theme';

@Component({
  selector: 'landing-page',
  imports: [
    // RouterOutlet,
    RouterLink,
    // RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    UiTheme,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {}
