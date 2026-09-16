import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  ElementRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import * as Cesium from 'cesium';
import chalk from 'chalk';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  setStartBtnVisibility,
  getBtnVisibilityObserver,
} from '@/components/tools/lib/buttons-subgroups-visibility';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import type { SceneModeLiterals } from '@/common/services/viewer-service/viewer.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';

@Component({
  selector: 'scene-mode-changer',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './scene-mode-changer.html',
  styleUrls: ['../../../tools-panel.scss', './scene-mode-changer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneModeChanger implements OnInit, OnDestroy {
  protected readonly toolName: string = '3D/2D/Columbus';
  protected readonly rusToolName: string = 'Снимок экрана';

  constructor(
    private $viewerService: ViewerService,
    protected $toolsService: ToolsService,
    // -------------------------- Управление видимостью кнопки (входящей в группу инструментов) (start) -------------------------- //
    private el: ElementRef<HTMLElement>,
  ) {
    this.nextSceneModeDescription.set(this.getNextSceneMode());
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
  protected nowSceneModeDescription = computed<SceneModeLiterals>(() =>
    this.$viewerService.nowSceneModeDescription(),
  );
  protected nextSceneModeDescription = signal<SceneModeLiterals>('2D');
  protected getNextSceneMode(): SceneModeLiterals {
    let nextSceneMode: SceneModeLiterals = '2D';
    try {
      if (this.$viewerService.viewerHasLoaded()) {
        if (this.$viewerService.viewer.scene.mode === 3) {
          nextSceneMode = '2D';
        } else if (this.$viewerService.viewer.scene.mode === 2) {
          nextSceneMode = 'Columbus';
        } else if (this.$viewerService.viewer.scene.mode === 1) {
          nextSceneMode = '3D';
        }
      }
      return nextSceneMode;
    } catch (error: unknown) {
      console.log(error);
      return nextSceneMode;
    }
  }
  // protected disableChanging = signal<boolean>(false);
  protected changeSceneMode(): void {
    let sceneMode: Cesium.SceneMode = Cesium.SceneMode.SCENE3D;
    let nextSceneMode: SceneModeLiterals = '2D';
    try {
      if (!this.$viewerService.viewerHasLoaded()) return;
      if (this.$viewerService.cameraIsFlyingAround() === true) {
        this.$viewerService.setCameraFlyingAroundFlag(false);
      }
      this.$toolsService.setDrawingsBlocker(true);
      // this.disableChanging.set(true);
      if (this.$viewerService.viewer.scene.mode === 3) {
        this.$viewerService.viewer.scene.morphTo2D(); // to mode === 2
        sceneMode = Cesium.SceneMode.SCENE2D;
        nextSceneMode = 'Columbus';
      } else if (this.$viewerService.viewer.scene.mode === 2) {
        this.$viewerService.viewer.scene.morphToColumbusView(); // to mode === 1
        sceneMode = Cesium.SceneMode.COLUMBUS_VIEW;
        nextSceneMode = '3D';
      } else if (this.$viewerService.viewer.scene.mode === 1) {
        this.$viewerService.viewer.scene.morphTo3D(); // to mode === 3
        sceneMode = Cesium.SceneMode.SCENE3D;
        nextSceneMode = '2D';
      }
      this.$viewerService.setNowSceneMode(sceneMode); // отслеживается инструметнами (конфликт clampToGround для 2D и 2.5D)
      setTimeout(() => {
        this.nextSceneModeDescription.set(nextSceneMode);
        this.setLocalStorageSceneMode(sceneMode);
        // this.disableChanging.set(false); // default duration
        this.$toolsService.setDrawingsBlocker(false);
      }, 2000);
    } catch (error: unknown) {
      // this.disableChanging.set(false);
      this.$toolsService.setDrawingsBlocker(false);
      console.log(error);
    }
  }
  private setLocalStorageSceneMode(sceneMode: Cesium.SceneMode): void {
    try {
      let sceneModeDescription: SceneModeLiterals = '3D';
      if (sceneMode === Cesium.SceneMode.SCENE3D) {
        sceneModeDescription = '3D';
      }
      if (sceneMode === Cesium.SceneMode.SCENE2D) {
        sceneModeDescription = '2D';
      }
      if (sceneMode === Cesium.SceneMode.COLUMBUS_VIEW) {
        sceneModeDescription = 'Columbus';
      }
      localStorage.setItem('sceneMode', sceneModeDescription);
    } catch (error: unknown) {
      console.log(error);
    }
  }
}
