import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { DrawCircleService } from '@/components/tools/drawing-tools/components/draw-circle/services/draw-circle-service/draw-circle.service';
import {
  getRusDrawingToolName,
  type DrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
@Component({
  selector: 'draw-circle',
  providers: [],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  template: `
    <button
      [matTooltip]="getRusDrawingToolName(this.$drawCircleService.toolName)"
      matTooltipPosition="left"
      matTooltipShowDelay="1000"
      matBadge="1"
      matBadgeSize="small"
      [matBadgeHidden]="!this.$drawCircleService.isActive()"
      class="tool-panel-button"
      matButton="tonal"
      (mousedown)="this.$drawCircleService.buttonHandler($event)"
      [disabled]="!this.$drawCircleService.isActive() && $drawCircleService.drawingsBlocker()"
    >
      <mat-icon>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            fill="currentColor"
            d="M12 20a8 8 0 0 1-8-8a8 8 0 0 1 8-8a8 8 0 0 1 8 8a8 8 0 0 1-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"
          />
        </svg>
      </mat-icon>
    </button>
  `,
  styleUrls: ['../../../tools-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawCircle {
  declare public readonly toolName: DrawingToolName;
  constructor(
    protected readonly $drawCircleService: DrawCircleService,

  ) {
    this.toolName = this.$drawCircleService.toolName;
  }

  // Нормализация литерала названия инструмента
  protected getRusDrawingToolName = getRusDrawingToolName;
  public getToolName() {
    return this.$drawCircleService.toolName;
  }
  // Используются в родителе
  public cancelByEsc(): void {
    this.$drawCircleService.cancelThisTool();
  }
}
