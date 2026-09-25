import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { FlyAroundService } from '@/components/tools/camera-view-tools/components/fly-around/services/fly-around-service/fly-around.service';

import {
  getRusCameraToolName,
  type CameraToolName,
} from '@/components/tools/camera-view-tools/services/camera-view-tools-service/camera-view-tools.service';
@Component({
  selector: 'fly-around',
  providers: [],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  template: `
    <button
      [matTooltip]="getRusCameraToolName(this.$flyAroundService.toolName)"
      matTooltipShowDelay="1000"
      matTooltipPosition="left"
      matBadge="1"
      matBadgeSize="small"
      [matBadgeHidden]="!this.$flyAroundService.isActive()"
      class="tool-panel-button"
      matButton="tonal"
      (mousedown)="this.$flyAroundService.buttonHandler($event)"
      [disabled]="!this.$flyAroundService.isActive() && $flyAroundService.drawingsBlocker()"
    >
      <mat-icon>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            fill="currentColor"
            d="M12 7C6.5 7 2 9.2 2 12c0 2.2 2.9 4.1 7 4.8V20l4-4l-4-4v2.7c-3.2-.6-5-1.9-5-2.7c0-1.1 3-3 8-3s8 1.9 8 3c0 .7-1.5 1.9-4 2.5v2.1c3.5-.8 6-2.5 6-4.6c0-2.8-4.5-5-10-5"
          />
        </svg>
      </mat-icon>
    </button>
  `,
  styleUrls: ['../../../tools-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlyAround {
  declare public readonly toolName: CameraToolName;
  public readonly toolNameAlt = 'flyAroundWithoutPoint' as const;
  constructor(
    protected readonly $flyAroundService: FlyAroundService,

  ) {
    this.toolName = this.$flyAroundService.toolName;
  }

  // Управление видимостью кнопки (входящей в группу инструментов)
  // -------------------------- Управление видимостью кнопки (входящей в группу инструментов) (end) -------------------------- //

  // Нормализация литерала названия инструмента
  protected getRusCameraToolName = getRusCameraToolName;
  public getToolName() {
    return this.$flyAroundService.toolName;
  }
  // Используются в родителе
  public cancelByEsc(): void {
    this.$flyAroundService.cancelThisTool();
  }
}
