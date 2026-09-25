import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { CalculateCircleService } from '@/components/tools/measuring-tools/components/calculate-circle/services/calculate-circle-service/calculate-circle.service';
import {
  getRusMeasuringToolName,
  type MeasuringToolName,
} from '@/components/tools/measuring-tools/services/measure-service/measure.service';
@Component({
  selector: 'calculate-circle',
  providers: [],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  template: `
    <button
      [matTooltip]="getRusMeasuringToolName($calculateCircleService.toolName)"
      matTooltipShowDelay="1000"
      matTooltipPosition="left"
      matBadge="1"
      matBadgeSize="small"
      [matBadgeHidden]="!$calculateCircleService.isActive()"
      class="tool-panel-button"
      matButton="tonal"
      (mousedown)="$calculateCircleService.buttonHandler($event)"
      [disabled]="
        !$calculateCircleService.isActive() &&
        $calculateCircleService.measuresBlocker()
      "
    >
      <mat-icon>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M6.36 18.78L6.61 21l1.62-1.54l2.77-7.6c-.68-.17-1.28-.51-1.77-.98zm8.41-7.9c-.49.47-1.1.81-1.77.98l2.77 7.6L17.39 21l.26-2.22zm.17-2.28c.3-1.56-.6-2.94-1.94-3.42V4c0-.55-.45-1-1-1s-1 .45-1 1v1.18C9.84 5.6 9 6.7 9 8c0 1.84 1.66 3.3 3.56 2.95c1.18-.22 2.15-1.17 2.38-2.35M12 9c-.55 0-1-.45-1-1s.45-1 1-1s1 .45 1 1s-.45 1-1 1"
          />
        </svg>
      </mat-icon>
    </button>
  `,
  styleUrls: ['../../../tools-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculateCircle {
  declare public readonly toolName: MeasuringToolName;
  constructor(
    protected readonly $calculateCircleService: CalculateCircleService,

  ) {
    this.toolName = this.$calculateCircleService.toolName;
  }

  // Управление видимостью кнопки (входящей в группу инструментов)
  // -------------------------- Управление видимостью кнопки (входящей в группу инструментов) (end) -------------------------- //

  // Нормализация литерала названия инструмента
  protected getRusMeasuringToolName = getRusMeasuringToolName;
  public getToolName() {
    return this.$calculateCircleService.toolName;
  }
  // Используются в родителе
  public cancelByEsc(): void {
    this.$calculateCircleService.cancelThisTool();
  }
}
