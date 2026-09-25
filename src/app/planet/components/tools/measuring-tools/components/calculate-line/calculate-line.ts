import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { CalculateLineService } from '@/components/tools/measuring-tools/components/calculate-line/services/calculate-line-service/calculate-line.service';
import {
  getRusMeasuringToolName,
  type MeasuringToolName,
} from '@/components/tools/measuring-tools/services/measure-service/measure.service';
@Component({
  selector: 'calculate-line',
  providers: [],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  template: `
    <button
      [matTooltip]="getRusMeasuringToolName($calculateLineService.toolName)"
      matTooltipShowDelay="1000"
      matTooltipPosition="left"
      matBadge="1"
      matBadgeSize="small"
      [matBadgeHidden]="!$calculateLineService.isActive()"
      class="tool-panel-button"
      matButton="tonal"
      (mousedown)="$calculateLineService.buttonHandler($event)"
      [disabled]="
        !$calculateLineService.isActive() && $calculateLineService.measuresBlocker()
      "
    >
      <mat-icon>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="m1.39 18.36l1.77-1.76L4.58 18l1.06-1.05l-1.42-1.41l1.42-1.42l2.47 2.48l1.06-1.06l-2.47-2.48l1.41-1.41l1.42 1.41L10.59 12l-1.42-1.41l1.42-1.42l2.47 2.48l1.06-1.06l-2.47-2.48l1.41-1.41l1.41 1.41l1.07-1.06l-1.42-1.41l1.42-1.42L18 6.7l1.07-1.06l-2.47-2.48l1.76-1.77l4.25 4.25L5.64 22.61z"
          />
        </svg>
      </mat-icon>
    </button>
  `,
  styleUrls: ['../../../tools-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculateLine {
  declare public readonly toolName: MeasuringToolName;
  constructor(
    protected readonly $calculateLineService: CalculateLineService,

  ) {
    this.toolName = this.$calculateLineService.toolName;
  }

  // Управление видимостью кнопки (входящей в группу инструментов)
  // -------------------------- Управление видимостью кнопки (входящей в группу инструментов) (end) -------------------------- //

  // Нормализация литерала названия инструмента
  protected getRusMeasuringToolName = getRusMeasuringToolName;
  public getToolName() {
    return this.$calculateLineService.toolName;
  }
  // Используются в родителе
  public cancelByEsc(): void {
    this.$calculateLineService.cancelThisTool();
  }
}
