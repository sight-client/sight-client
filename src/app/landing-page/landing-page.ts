import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  // RouterOutlet,
  RouterLink,
  // RouterLinkActive
} from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ThemeChanger } from '@global/components/theme-changer/theme-changer';

@Component({
  selector: 'landing-page',
  imports: [
    // RouterOutlet,
    RouterLink,
    // RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    ThemeChanger,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {}
