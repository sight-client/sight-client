import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { DrawMarkService } from '@/components/tools/drawing-tools/components/draw-mark/services/draw-mark-service/draw-mark.service';
import {
  getRusDrawingToolName,
  type DrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
@Component({
  selector: 'draw-mark',
  providers: [],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  template: `
    <button
      [matTooltip]="getRusDrawingToolName(this.$drawMarkService.toolName)"
      matTooltipShowDelay="1000"
      matTooltipPosition="left"
      matBadge="1"
      matBadgeSize="small"
      [matBadgeHidden]="!this.$drawMarkService.isActive()"
      class="tool-panel-button"
      matButton="tonal"
      (mousedown)="this.$drawMarkService.buttonHandler($event)"
      [disabled]="!this.$drawMarkService.isActive() && this.$drawMarkService.drawingsBlocker()"
    >
      <mat-icon>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5"
          />
        </svg>
      </mat-icon>
    </button>
  `,
  styleUrls: ['../../../tools-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawMark {
  declare public readonly toolName: DrawingToolName;
  constructor(
    protected readonly $drawMarkService: DrawMarkService,
  ) {
    this.toolName = this.$drawMarkService.toolName;
  }

  // -------------------------- Управление видимостью кнопки (входящей в группу инструментов) (end) -------------------------- //

  // Нормализация литерала названия инструмента
  protected getRusDrawingToolName = getRusDrawingToolName;
  public getToolName() {
    return this.$drawMarkService.toolName;
  }
  // Используются в родителе
  public cancelByEsc(): void {
    this.$drawMarkService.cancelThisTool();
  }
}
