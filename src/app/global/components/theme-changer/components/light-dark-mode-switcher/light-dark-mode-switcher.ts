import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Signal,
  Input,
  // ViewEncapsulation,
} from '@angular/core';
// import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SetLightDarkModeService } from '@global/services/set-light-dark-mode-service/set-light-dark-mode.service';

@Component({
  selector: 'light-dark-mode-switcher',
  imports: [
    // MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    @if (inMenu) {
      <button class="user-menu-import-button" (click)="setColorScheme($event)">
        <!-- (keydown.enter)="setColorScheme($event)" -->
        <mat-icon>
          @if (!isChecked()) {
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M10 2c-1.82 0-3.53.5-5 1.35C8 5.08 10 8.3 10 12s-2 6.92-5 8.65C6.47 21.5 8.18 22 10 22a10 10 0 0 0 10-10A10 10 0 0 0 10 2"
              />
            </svg>
          } @else {
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="m3.55 19.09l1.41 1.41l1.8-1.79l-1.42-1.42M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6s6-2.69 6-6c0-3.32-2.69-6-6-6m8 7h3v-2h-3m-2.76 7.71l1.8 1.79l1.41-1.41l-1.79-1.8M20.45 5l-1.41-1.4l-1.8 1.79l1.42 1.42M13 1h-2v3h2M6.76 5.39L4.96 3.6L3.55 5l1.79 1.81zM1 13h3v-2H1m12 9h-2v3h2"
              />
            </svg>
          }
          <!-- <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M7.5 2c-1.79 1.15-3 3.18-3 5.5s1.21 4.35 3.03 5.5C4.46 13 2 10.54 2 7.5A5.5 5.5 0 0 1 7.5 2m11.57 1.5l1.43 1.43L4.93 20.5L3.5 19.07zm-6.18 2.43L11.41 5L9.97 6l.42-1.7L9 3.24l1.75-.12l.58-1.65L12 3.1l1.73.03l-1.35 1.13zm-3.3 3.61l-1.16-.73l-1.12.78l.34-1.32l-1.09-.83l1.36-.09l.45-1.29l.51 1.27l1.36.03l-1.05.87zM19 13.5a5.5 5.5 0 0 1-5.5 5.5c-1.22 0-2.35-.4-3.26-1.07l7.69-7.69c.67.91 1.07 2.04 1.07 3.26m-4.4 6.58l2.77-1.15l-.24 3.35zm4.33-2.7l1.15-2.77l2.2 2.54zm1.15-4.96l-1.14-2.78l3.34.24zM9.63 18.93l2.77 1.15l-2.53 2.19z"
            />
          </svg> -->
        </mat-icon>
        <span>{{ !isChecked() ? 'Темная тема' : 'Светлая тема' }}</span>
      </button>
    } @else {
      <!-- <div class="light-dark-mode-slider-container">
        <mat-slide-toggle
          [title]="isChecked() ? 'Темный режим' : 'Светлый режим'"
          [checked]="isChecked()"
          (change)="setColorScheme($event.checked)"
        ></mat-slide-toggle>
      </div> -->
      <button
        [matTooltip]="!isChecked() ? 'Темная тема' : 'Светлая тема'"
        matTooltipShowDelay="1000"
        class="light-dark-mode-slider-button"
        matButton="tonal"
        (click)="setColorScheme($event)"
      >
        <mat-icon>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M7.5 2c-1.79 1.15-3 3.18-3 5.5s1.21 4.35 3.03 5.5C4.46 13 2 10.54 2 7.5A5.5 5.5 0 0 1 7.5 2m11.57 1.5l1.43 1.43L4.93 20.5L3.5 19.07zm-6.18 2.43L11.41 5L9.97 6l.42-1.7L9 3.24l1.75-.12l.58-1.65L12 3.1l1.73.03l-1.35 1.13zm-3.3 3.61l-1.16-.73l-1.12.78l.34-1.32l-1.09-.83l1.36-.09l.45-1.29l.51 1.27l1.36.03l-1.05.87zM19 13.5a5.5 5.5 0 0 1-5.5 5.5c-1.22 0-2.35-.4-3.26-1.07l7.69-7.69c.67.91 1.07 2.04 1.07 3.26m-4.4 6.58l2.77-1.15l-.24 3.35zm4.33-2.7l1.15-2.77l2.2 2.54zm1.15-4.96l-1.14-2.78l3.34.24zM9.63 18.93l2.77 1.15l-2.53 2.19z"
            />
          </svg>
          <!-- @if (!isChecked()) {
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M10 2c-1.82 0-3.53.5-5 1.35C8 5.08 10 8.3 10 12s-2 6.92-5 8.65C6.47 21.5 8.18 22 10 22a10 10 0 0 0 10-10A10 10 0 0 0 10 2"
              />
            </svg>
          } @else {
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="m3.55 19.09l1.41 1.41l1.8-1.79l-1.42-1.42M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6s6-2.69 6-6c0-3.32-2.69-6-6-6m8 7h3v-2h-3m-2.76 7.71l1.8 1.79l1.41-1.41l-1.79-1.8M20.45 5l-1.41-1.4l-1.8 1.79l1.42 1.42M13 1h-2v3h2M6.76 5.39L4.96 3.6L3.55 5l1.79 1.81zM1 13h3v-2H1m12 9h-2v3h2"
              />
            </svg>
          } -->
        </mat-icon>
      </button>
    }
  `,
  styleUrl: './light-dark-mode-switcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // encapsulation: ViewEncapsulation.None,
})
export class LightDarkModeSwitcher {
  @Input() inMenu: boolean;
  constructor(private $setLightDarkModeService: SetLightDarkModeService) {}
  protected isChecked: Signal<boolean> = computed(() =>
    this.$setLightDarkModeService.isDarkChecked(),
  );
  // Функция на кнопке:
  public setColorScheme(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    // if (checked !== undefined) {
    //   this.$setLightDarkModeService.setColorScheme(checked);
    // } else {
    this.$setLightDarkModeService.setColorScheme(!this.isChecked());
    // }
  }
}
