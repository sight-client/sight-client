import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MeasureService } from '@/common/services/measure-service/measure.service';

@Component({
  selector: 'clear-measurements',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button
      title="Очистка карты"
      class="masuring-tool-button"
      matButton="tonal"
      (click)="$measureService.clearMeasuresDataSource()"
      [disabled]="$measureService.measuresBlocker()"
    >
      <mat-icon>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2M4 12c0-4.42 3.58-8 8-8c1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.9 7.9 0 0 1 4 12m8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.9 7.9 0 0 1 20 12c0 4.42-3.58 8-8 8"
          />
        </svg>
      </mat-icon>
    </button>
  `,
  styleUrls: ['../../measuring-tools.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClearMeasurements {
  constructor(protected $measureService: MeasureService) {}
}
