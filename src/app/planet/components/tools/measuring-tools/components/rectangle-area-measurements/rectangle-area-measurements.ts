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

import { RectangleAreaMeasurementsService } from '@/components/tools/measuring-tools/components/rectangle-area-measurements/services/rectangle-area-measurements-service/rectangle-area-measurements.service';
import { getRusMeasuringToolName } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import {
  setStartBtnVisibility,
  getBtnVisibilityObserver,
} from '@/components/tools/lib/buttons-subgroups-visibility';

@Component({
  selector: 'rectangle-area-measurements',
  providers: [],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  template: `
    <button
      [style.display]="buttonVisibility() ? 'block' : 'none'"
      [matTooltip]="getRusMeasuringToolName($rectangleAreaMeasurementsService.toolName)"
      matTooltipShowDelay="1000"
      matTooltipPosition="left"
      matBadge="1"
      matBadgeSize="small"
      [matBadgeHidden]="!$rectangleAreaMeasurementsService.isActive()"
      class="tool-panel-button"
      matButton="tonal"
      (mousedown)="$rectangleAreaMeasurementsService.buttonHandler($event)"
      [disabled]="
        !$rectangleAreaMeasurementsService.isActive() &&
        $rectangleAreaMeasurementsService.measuresBlocker()
      "
    >
      <mat-icon>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            fill="currentColor"
            d="M20 2H4c-1.1 0-2 .9-2 2v16a2 2 0 0 0 2 2h16c1.11 0 2-.89 2-2V4a2 2 0 0 0-2-2M4 6l2-2h4.9L4 10.9zm0 7.7L13.7 4h4.9L4 18.6zM20 18l-2 2h-4.9l6.9-6.9zm0-7.7L10.3 20H5.4L20 5.4z"
          />
        </svg>
      </mat-icon>
    </button>
  `,
  styleUrls: ['../../../tools-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RectangleAreaMeasurements implements OnInit, OnDestroy {
  declare public readonly toolName;
  constructor(
    protected readonly $rectangleAreaMeasurementsService: RectangleAreaMeasurementsService,

    // -------------------------- Управление видимостью кнопки (входящей в группу инструментов) (start) -------------------------- //
    private el: ElementRef<HTMLElement>,
  ) {
    this.toolName = this.$rectangleAreaMeasurementsService.toolName;
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
  protected getRusMeasuringToolName = getRusMeasuringToolName;
  public getToolName() {
    return this.$rectangleAreaMeasurementsService.toolName;
  }
  // Используются в родителе
  public cancelByEsc(): void {
    this.$rectangleAreaMeasurementsService.cancelThisTool();
  }
}
