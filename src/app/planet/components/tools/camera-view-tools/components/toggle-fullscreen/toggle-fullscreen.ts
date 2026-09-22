import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  ElementRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import chalk from 'chalk';
import * as Cesium from 'cesium';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  setStartBtnVisibility,
  getBtnVisibilityObserver,
} from '@/components/tools/lib/buttons-subgroups-visibility';

import { ToolsService } from '@/components/tools/services/tools-service/tools.service';

const ENTER_FULLSCREEN_PATH =
  'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z';
const EXIT_FULLSCREEN_PATH =
  'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z';

@Component({
  selector: 'toggle-fullscreen',
  providers: [],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <button
      [style.display]="buttonVisibility() ? 'block' : 'none'"
      [matTooltip]="buttonTooltip()"
      [attr.aria-label]="buttonTooltip()"
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
          <path fill="currentColor" [attr.d]="iconPath()" />
        </svg>
      </mat-icon>
    </button>
  `,
  styleUrls: ['../../../tools-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleFullscreen implements OnInit, OnDestroy {
  protected readonly toolName: string = 'toggleFullscreen';
  protected readonly rusToolName: string = 'На весь экран';
  protected readonly isFullscreen = signal(false);
  protected readonly buttonTooltip = computed(() =>
    this.isFullscreen() ? 'Выйти из полноэкранного режима' : this.rusToolName,
  );
  protected readonly iconPath = computed(() =>
    this.isFullscreen() ? EXIT_FULLSCREEN_PATH : ENTER_FULLSCREEN_PATH,
  );
  private fullscreenChangeEventName: string | undefined;

  constructor(
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
    this.syncFullscreenState();
    this.fullscreenChangeEventName = Cesium.Fullscreen.changeEventName || 'fullscreenchange';
    document.addEventListener(this.fullscreenChangeEventName, this.syncFullscreenState);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    if (this.fullscreenChangeEventName) {
      document.removeEventListener(this.fullscreenChangeEventName, this.syncFullscreenState);
    }
  }
  // -------------------------- Управление видимостью кнопки (входящей в группу инструментов) (end) -------------------------- //

  private syncFullscreenState = (): void => {
    this.isFullscreen.set(Boolean(document.fullscreenElement) || Cesium.Fullscreen.fullscreen);
  };

  protected buttonHandler(event: MouseEvent): void {
    // do not call event.stopPropagation()
    if (event.button !== 0) return;
    const target = document.body;
    if (Cesium.Fullscreen.fullscreen || document.fullscreenElement) {
      Cesium.Fullscreen.exitFullscreen();
    } else {
      Cesium.Fullscreen.requestFullscreen(target);
    }
  }
}
