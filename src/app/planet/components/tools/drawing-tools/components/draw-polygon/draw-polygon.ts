import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { DrawPolygonService } from '@/components/tools/drawing-tools/components/draw-polygon/services/draw-polygon-service/draw-polygon.service';
import {
  getRusDrawingToolName,
  type DrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
@Component({
  selector: 'draw-polygon',
  providers: [],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  template: `
    <button
      [matTooltip]="getRusDrawingToolName(this.$drawPolygonService.toolName)"
      matTooltipShowDelay="1000"
      matTooltipPosition="left"
      matBadge="1"
      matBadgeSize="small"
      [matBadgeHidden]="!this.$drawPolygonService.isActive()"
      class="tool-panel-button"
      matButton="tonal"
      (mousedown)="this.$drawPolygonService.buttonHandler($event)"
      [disabled]="!this.$drawPolygonService.isActive() && $drawPolygonService.drawingsBlocker()"
    >
      <mat-icon>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18s-.41-.06-.57-.18l-7.9-4.44A.99.99 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18s.41.06.57.18l7.9 4.44c.32.17.53.5.53.88zM12 4.15L5 8.09v7.82l7 3.94l7-3.94V8.09z"
          />
        </svg>
      </mat-icon>
    </button>
  `,
  styleUrls: ['../../../tools-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawPolygon {
  declare public readonly toolName: DrawingToolName;
  constructor(
    protected readonly $drawPolygonService: DrawPolygonService,

  ) {
    this.toolName = this.$drawPolygonService.toolName;
  }

  // Нормализация литерала названия инструмента
  protected getRusDrawingToolName = getRusDrawingToolName;
  public getToolName() {
    return this.$drawPolygonService.toolName;
  }
  // Используются в родителе
  public cancelByEsc(): void {
    this.$drawPolygonService.cancelThisTool();
  }
}
