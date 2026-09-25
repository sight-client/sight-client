import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { DrawLineService } from '@/components/tools/drawing-tools/components/draw-line/services/draw-line-service/draw-line.service';
import {
  getRusDrawingToolName,
  type DrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
@Component({
  selector: 'draw-line',
  providers: [],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  template: `
    <button
      [matTooltip]="getRusDrawingToolName(this.$drawLineService.toolName)"
      matTooltipShowDelay="1000"
      matTooltipPosition="left"
      matBadge="1"
      matBadgeSize="small"
      [matBadgeHidden]="!this.$drawLineService.isActive()"
      class="tool-panel-button"
      matButton="tonal"
      (mousedown)="this.$drawLineService.buttonHandler($event)"
      [disabled]="!this.$drawLineService.isActive() && $drawLineService.drawingsBlocker()"
    >
      <mat-icon>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path fill="currentColor" d="m3.5 18.5l6-6l4 4L22 6.92L20.59 5.5l-7.09 8l-4-4L2 17z" />
        </svg>
      </mat-icon>
    </button>
  `,
  styleUrls: ['../../../tools-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawLine {
  declare public readonly toolName: DrawingToolName;
  constructor(
    protected readonly $drawLineService: DrawLineService,

  ) {
    this.toolName = this.$drawLineService.toolName;
  }

  // Нормализация литерала названия инструмента
  protected getRusDrawingToolName = getRusDrawingToolName;
  public getToolName() {
    return this.$drawLineService.toolName;
  }
  // Используются в родителе
  public cancelByEsc(): void {
    this.$drawLineService.cancelThisTool();
  }
}
