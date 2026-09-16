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

import { AddLineService } from '@/components/tools/drawing-tools/components/add-line/services/add-line-service/add-line.service';
import { getRusDrawingToolName } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import {
  setStartBtnVisibility,
  getBtnVisibilityObserver,
} from '@/components/tools/lib/buttons-subgroups-visibility';

@Component({
  selector: 'add-line',
  providers: [],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  template: `
    <button
      [style.display]="buttonVisibility() ? 'block' : 'none'"
      [matTooltip]="getRusDrawingToolName(this.$addLineService.toolName)"
      matTooltipShowDelay="1000"
      matTooltipPosition="left"
      matBadge="1"
      matBadgeSize="small"
      [matBadgeHidden]="!this.$addLineService.isActive()"
      class="tool-panel-button"
      matButton="tonal"
      (mousedown)="this.$addLineService.buttonHandler($event)"
      [disabled]="!this.$addLineService.isActive() && $addLineService.drawingsBlocker()"
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
export class AddLine implements OnInit, OnDestroy {
  declare public readonly toolName;
  constructor(
    protected readonly $addLineService: AddLineService,

    // -------------------------- Управление видимостью кнопки (входящей в группу инструментов) (start) -------------------------- //
    private el: ElementRef<HTMLElement>,
  ) {
    this.toolName = this.$addLineService.toolName;
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
    return this.$addLineService.toolName;
  }
  // Используются в родителе
  public cancelByEsc(): void {
    this.$addLineService.cancelThisTool();
  }
}
