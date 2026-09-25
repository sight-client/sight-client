import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { CalculateRectangleService } from '@/components/tools/measuring-tools/components/calculate-rectangle/services/calculate-rectangle-service/calculate-rectangle.service';
import {
  getRusMeasuringToolName,
  type MeasuringToolName,
} from '@/components/tools/measuring-tools/services/measure-service/measure.service';
@Component({
  selector: 'calculate-rectangle',
  providers: [],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  template: `
    <button
      [matTooltip]="getRusMeasuringToolName($calculateRectangleService.toolName)"
      matTooltipShowDelay="1000"
      matTooltipPosition="left"
      matBadge="1"
      matBadgeSize="small"
      [matBadgeHidden]="!$calculateRectangleService.isActive()"
      class="tool-panel-button"
      matButton="tonal"
      (mousedown)="$calculateRectangleService.buttonHandler($event)"
      [disabled]="
        !$calculateRectangleService.isActive() &&
        $calculateRectangleService.measuresBlocker()
      "
    >
      <mat-icon>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            fill="currentColor"
            d="M20 2H4c-1.1 0-2 .9-2 2v16a2 2 0 0 0 2 2h16c1.11 0 2-.89 2-2V4a2 2 0 0 0-2-2M4 6l2-2h4.9L4 10.9zm0 7.7L13.7 4h4.9L4 18.6zM20 18l-2 2h-4.9l6.9-6.9zm0-7.7L10.3 20H5.4L20 5.4z"
          />
        </svg>
      </mat-icon>
    </button>
  `,
  styleUrls: ['../../../tools-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculateRectangle {
  declare public readonly toolName: MeasuringToolName;
  constructor(
    protected readonly $calculateRectangleService: CalculateRectangleService,

  ) {
    this.toolName = this.$calculateRectangleService.toolName;
  }

  // Управление видимостью кнопки (входящей в группу инструментов)
  // -------------------------- Управление видимостью кнопки (входящей в группу инструментов) (end) -------------------------- //

  // Нормализация литерала названия инструмента
  protected getRusMeasuringToolName = getRusMeasuringToolName;
  public getToolName() {
    return this.$calculateRectangleService.toolName;
  }
  // Используются в родителе
  public cancelByEsc(): void {
    this.$calculateRectangleService.cancelThisTool();
  }
}
