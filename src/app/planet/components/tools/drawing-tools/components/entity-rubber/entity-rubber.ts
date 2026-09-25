import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { EntityRubberService } from '@/components/tools/drawing-tools/components/entity-rubber/services/entity-rubber.service';
@Component({
  selector: 'entity-rubber',
  providers: [],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  template: `
    <button
      matTooltip="Ластик"
      matTooltipShowDelay="1000"
      matTooltipPosition="left"
      matBadge="1"
      matBadgeSize="small"
      [matBadgeHidden]="!this.$entityRubberService.isActive()"
      class="tool-panel-button"
      matButton="tonal"
      (mousedown)="this.$entityRubberService.buttonHandler($event)"
      [disabled]="!$entityRubberService.isActive() && $entityRubberService.drawingsBlocker()"
    >
      <!-- || $entityRubberService.storesAreEmpty() === true -->
      <mat-icon>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="m16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.01 4.01 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53l-4.95-4.95z"
          />
        </svg>
      </mat-icon>
    </button>
  `,
  styleUrls: ['../../../tools-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityRubber {
  public readonly toolName = 'entityRubber';
  constructor(
    protected $entityRubberService: EntityRubberService,

  ) {}

  // Управление видимостью кнопки (входящей в группу инструментов)
  // -------------------------- Управление видимостью кнопки (входящей в группу инструментов) (end) -------------------------- //

  // Используется в родителе
  public cancelByEsc(): void {
    this.$entityRubberService.cancelThisTool();
  }
}
