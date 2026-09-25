import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { CalculatePolygonService } from '@/components/tools/measuring-tools/components/calculate-polygon/services/calculate-polygon-service/calculate-polygon.service';
import {
  getRusMeasuringToolName,
  type MeasuringToolName,
} from '@/components/tools/measuring-tools/services/measure-service/measure.service';
@Component({
  selector: 'calculate-polygon',
  providers: [],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  template: `
    <button
      [matTooltip]="getRusMeasuringToolName($calculatePolygonService.toolName)"
      matTooltipShowDelay="1000"
      matTooltipPosition="left"
      matBadge="1"
      matBadgeSize="small"
      [matBadgeHidden]="!$calculatePolygonService.isActive()"
      class="tool-panel-button"
      matButton="tonal"
      (mousedown)="$calculatePolygonService.buttonHandler($event)"
      [disabled]="
        !$calculatePolygonService.isActive() &&
        $calculatePolygonService.measuresBlocker()
      "
    >
      <mat-icon>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path fill="currentColor" d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27" />
        </svg>
      </mat-icon>
    </button>
  `,
  styleUrls: ['../../../tools-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatePolygon {
  declare public readonly toolName: MeasuringToolName;
  constructor(
    protected readonly $calculatePolygonService: CalculatePolygonService,

  ) {
    this.toolName = this.$calculatePolygonService.toolName;
  }

  // Управление видимостью кнопки (входящей в группу инструментов)
  // -------------------------- Управление видимостью кнопки (входящей в группу инструментов) (end) -------------------------- //

  // Нормализация литерала названия инструмента
  protected getRusMeasuringToolName = getRusMeasuringToolName;
  public getToolName() {
    return this.$calculatePolygonService.toolName;
  }
  // Используются в родителе
  public cancelByEsc(): void {
    this.$calculatePolygonService.cancelThisTool();
  }
}
