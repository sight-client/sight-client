import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { DrawRectangleService } from '@/components/tools/drawing-tools/components/draw-rectangle/services/draw-rectangle-service/draw-rectangle.service';
import {
  getRusDrawingToolName,
  type DrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
@Component({
  selector: 'draw-rectangle',
  providers: [],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  template: `
    <button
      [matTooltip]="getRusDrawingToolName(this.$drawRectangleService.toolName)"
      matTooltipShowDelay="1000"
      matTooltipPosition="left"
      matBadge="1"
      matBadgeSize="small"
      [matBadgeHidden]="!this.$drawRectangleService.isActive()"
      class="tool-panel-button"
      matButton="tonal"
      (mousedown)="this.$drawRectangleService.buttonHandler($event)"
      [disabled]="!this.$drawRectangleService.isActive() && $drawRectangleService.drawingsBlocker()"
    >
      <mat-icon>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path fill="currentColor" d="M3 3h18v18H3zm2 2v14h14V5z" />
        </svg>
      </mat-icon>
    </button>
  `,
  styleUrls: ['../../../tools-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawRectangle {
  declare public readonly toolName: DrawingToolName;
  constructor(
    protected readonly $drawRectangleService: DrawRectangleService,

  ) {
    this.toolName = this.$drawRectangleService.toolName;
  }

  // Нормализация литерала названия инструмента
  protected getRusDrawingToolName = getRusDrawingToolName;
  public getToolName() {
    return this.$drawRectangleService.toolName;
  }
  // Используются в родителе
  public cancelByEsc(): void {
    this.$drawRectangleService.cancelThisTool();
  }
}
