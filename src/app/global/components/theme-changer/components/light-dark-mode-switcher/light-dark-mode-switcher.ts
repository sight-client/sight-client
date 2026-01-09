import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Signal,
  // ViewEncapsulation,
} from '@angular/core';
// import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SetLightDarkModeService } from '@global/services/set-light-dark-mode-service/set-light-dark-mode.service';

@Component({
  selector: 'light-dark-mode-switcher',
  imports: [
    // MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <!-- <div class="light-dark-mode-slider-container">
      <mat-slide-toggle
        [title]="isChecked() ? 'Темный режим' : 'Светлый режим'"
        [checked]="isChecked()"
        (change)="setColorScheme($event.checked)"
      ></mat-slide-toggle>
    </div> -->
    <button
      [title]="isChecked() ? 'Темная тема' : 'Светлая тема'"
      class="light-dark-mode-slider-button"
      matButton="tonal"
      (click)="setColorScheme(!isChecked())"
    >
      <mat-icon>
        @if (isChecked()) {
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M10 2c-1.82 0-3.53.5-5 1.35C8 5.08 10 8.3 10 12s-2 6.92-5 8.65C6.47 21.5 8.18 22 10 22a10 10 0 0 0 10-10A10 10 0 0 0 10 2"
            />
          </svg>
        } @else {
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 8a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4a4 4 0 0 0-4-4m0 10a6 6 0 0 1-6-6a6 6 0 0 1 6-6a6 6 0 0 1 6 6a6 6 0 0 1-6 6m8-9.31V4h-4.69L12 .69L8.69 4H4v4.69L.69 12L4 15.31V20h4.69L12 23.31L15.31 20H20v-4.69L23.31 12z"
            />
          </svg>
        }
      </mat-icon>
    </button>
  `,
  styleUrl: './light-dark-mode-switcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // encapsulation: ViewEncapsulation.None,
})
export class LightDarkModeSwitcher {
  constructor(private $setLightDarkModeService: SetLightDarkModeService) {}
  protected isChecked: Signal<boolean> = computed(() =>
    this.$setLightDarkModeService.isTogglesChecked(),
  );
  // Функция на кнопке:
  protected setColorScheme(checked: boolean) {
    this.$setLightDarkModeService.setColorScheme(checked);
  }
}
