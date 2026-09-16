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

import { AddRectangleService } from '@/components/tools/drawing-tools/components/add-rectangle/services/add-rectangle-service/add-rectangle.service';
import { getRusDrawingToolName } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import {
  setStartBtnVisibility,
  getBtnVisibilityObserver,
} from '@/components/tools/lib/buttons-subgroups-visibility';

@Component({
  selector: 'add-rectangle',
  providers: [],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  template: `
    <button
      [style.display]="buttonVisibility() ? 'block' : 'none'"
      [matTooltip]="getRusDrawingToolName(this.$addRectangleService.toolName)"
      matTooltipShowDelay="1000"
      matTooltipPosition="left"
      matBadge="1"
      matBadgeSize="small"
      [matBadgeHidden]="!this.$addRectangleService.isActive()"
      class="tool-panel-button"
      matButton="tonal"
      (mousedown)="this.$addRectangleService.buttonHandler($event)"
      [disabled]="!this.$addRectangleService.isActive() && $addRectangleService.drawingsBlocker()"
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
export class AddRectangle implements OnInit, OnDestroy {
  declare public readonly toolName;
  constructor(
    protected readonly $addRectangleService: AddRectangleService,

    // -------------------------- Управление видимостью кнопки (входящей в группу инструментов) (start) -------------------------- //
    private el: ElementRef<HTMLElement>,
  ) {
    this.toolName = this.$addRectangleService.toolName;
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
    return this.$addRectangleService.toolName;
  }
  // Используются в родителе
  public cancelByEsc(): void {
    this.$addRectangleService.cancelThisTool();
  }
}
