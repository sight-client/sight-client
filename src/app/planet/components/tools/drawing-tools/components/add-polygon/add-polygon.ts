import {
  Component,
  ChangeDetectionStrategy,
  signal,
  ElementRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import chalk from 'chalk';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { AddPolygonService } from '@/components/tools/drawing-tools/components/add-polygon/services/add-polygon-service/add-polygon.service';
import { getRusDrawingToolName } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import {
  setStartBtnVisibility,
  getBtnVisibilityObserver,
} from '@/components/tools/lib/buttons-subgroups-visibility';

@Component({
  selector: 'add-polygon',
  providers: [],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  template: `
    <button
      [style.display]="buttonVisibility() ? 'block' : 'none'"
      [matTooltip]="getRusDrawingToolName(this.$addPolygonService.toolName)"
      matTooltipShowDelay="1000"
      matTooltipPosition="left"
      matBadge="1"
      matBadgeSize="small"
      [matBadgeHidden]="!this.$addPolygonService.isActive()"
      class="tool-panel-button"
      matButton="tonal"
      (mousedown)="this.$addPolygonService.buttonHandler($event)"
      [disabled]="!this.$addPolygonService.isActive() && $addPolygonService.drawingsBlocker()"
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
export class AddPolygon implements OnInit, OnDestroy {
  declare public readonly toolName;
  constructor(
    protected readonly $addPolygonService: AddPolygonService,

    // -------------------------- Управление видимостью кнопки (входящей в группу инструментов) (start) -------------------------- //
    private el: ElementRef<HTMLElement>,
  ) {
    this.toolName = this.$addPolygonService.toolName;
  }

  // Управление видимостью кнопки (входящей в группу инструментов)
  protected buttonVisibility = signal<boolean>(false);
  private observer: MutationObserver | undefined;

  ngOnInit() {
    try {
      // Определение стартового значения флага видимости кнопки
      if (setStartBtnVisibility(this.el, this.buttonVisibility)) {
        // Отслеживание изменения кастомного атрибута хоста для выставления флага видимости кнопки
        this.observer = getBtnVisibilityObserver(this.el, this.buttonVisibility);
        if (this.observer !== undefined) {
          this.observer.observe(this.el.nativeElement, {
            attributes: true,
          });
        } else throw new Error('getBtnVisibilityObserver fn has failed');
      } else throw new Error('setStartBtnVisibility fn has failed');
    } catch (error: unknown) {
      console.log(chalk.red(error));
      if (error instanceof Error) console.log(error.stack);
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
  // -------------------------- Управление видимостью кнопки (входящей в группу инструментов) (end) -------------------------- //

  // Нормализация литерала названия инструмента
  protected getRusDrawingToolName = getRusDrawingToolName;
  public getToolName() {
    return this.$addPolygonService.toolName;
  }
  // Используются в родителе
  public cancelByEsc(): void {
    this.$addPolygonService.cancelThisTool();
  }
}
