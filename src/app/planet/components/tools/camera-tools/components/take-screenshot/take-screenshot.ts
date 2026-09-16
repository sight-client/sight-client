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

import {
  setStartBtnVisibility,
  getBtnVisibilityObserver,
} from '@/components/tools/lib/buttons-subgroups-visibility';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';

@Component({
  selector: 'take-screenshot',
  providers: [],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <button
      [style.display]="buttonVisibility() ? 'block' : 'none'"
      [matTooltip]="rusToolName"
      matTooltipShowDelay="1000"
      matTooltipPosition="left"
      class="tool-panel-button"
      matButton="tonal"
      (mousedown)="buttonHandler($event)"
      [disabled]="$toolsService.drawingsBlocker()"
    >
      <mat-icon>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            fill="currentColor"
            d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m8 3a5 5 0 0 0-5 5a5 5 0 0 0 5 5a5 5 0 0 0 5-5a5 5 0 0 0-5-5m0 2a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3"
          />
        </svg>
      </mat-icon>
    </button>
  `,
  styleUrls: ['../../../tools-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TakeScreenshot implements OnInit, OnDestroy {
  protected readonly toolName: string = 'takeScreenshot';
  protected readonly rusToolName: string = 'Снимок экрана';
  constructor(
    private $viewerService: ViewerService,
    protected $toolsService: ToolsService,
    // -------------------------- Управление видимостью кнопки (входящей в группу инструментов) (start) -------------------------- //
    private el: ElementRef<HTMLElement>,
  ) {}

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
  private takingScreenshotTimout: number;
  protected buttonHandler(event: MouseEvent) {
    // event.stopPropagation(); // не применять! (событие также ловится в родителе (camera-tools.ts))
    if (event.button === 0) {
      clearTimeout(this.takingScreenshotTimout);
      this.takingScreenshotTimout = setTimeout(() => {
        /* Увеличит разрешение снимка х3 (кадр остается прежним, качество улучшается) */
        // this.$viewerService.viewer.resolutionScale = 3.0;
        this.$viewerService.viewer.render();
        this.$viewerService.viewer.canvas.toBlob((blob) => {
          const localDate = new Date();
          const timeZoneOffset = localDate.getTimezoneOffset();
          /* Необходима, т.к. .toISOString() работает только с UTC+0 */
          const utcDate = new Date(localDate.getTime() - timeZoneOffset * 60 * 1000);
          const trueTodayDate = utcDate.toISOString().split('T')[0];
          const time = localDate.toLocaleTimeString('it-IT');
          /* Имитация браузерной загрузки содержимого по ссылке */
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob as Blob);
          document.body.appendChild(a);
          a.download = `screenshot-sight-${trueTodayDate}-${time}`;
          a.click();
          document.body.removeChild(a);
        });
        // this.$viewerService.viewer.resolutionScale = 1.0; // обратно
      }, 500);
    }
  }
}
