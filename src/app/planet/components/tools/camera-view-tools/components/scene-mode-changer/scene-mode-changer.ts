import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import * as Cesium from 'cesium';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { reportError } from '@global/lib/report-error.lib';
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
export class SceneModeChanger {
  protected readonly toolName = '3D/2D/Columbus' as const;
  protected readonly rusToolName = 'Снимок экрана' as const;

  constructor(
    private $viewerService: ViewerService,
    protected $toolsService: ToolsService,
  ) {
    this.nextSceneModeDescription.set(this.getNextSceneMode());
  }

  protected nowSceneModeDescription = computed<SceneModeLiterals>(() =>
    this.$viewerService.nowSceneModeDescription(),
  );
  protected nextSceneModeDescription = signal<SceneModeLiterals>('2D');
  protected getNextSceneMode(): SceneModeLiterals {
    let nextSceneMode: SceneModeLiterals = '2D';
    try {
      if (this.$viewerService.viewerHasLoaded()) {
        const mode = this.$viewerService.viewer.scene.mode;
        if (mode === Cesium.SceneMode.SCENE3D) {
          nextSceneMode = '2D';
        } else if (mode === Cesium.SceneMode.SCENE2D) {
          nextSceneMode = 'Columbus';
        } else if (mode === Cesium.SceneMode.COLUMBUS_VIEW) {
          nextSceneMode = '3D';
        }
      }
      return nextSceneMode;
    } catch (error: unknown) {
      reportError(error);
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
      const mode = this.$viewerService.viewer.scene.mode;
      if (mode === Cesium.SceneMode.SCENE3D) {
        this.$viewerService.viewer.scene.morphTo2D();
        sceneMode = Cesium.SceneMode.SCENE2D;
        nextSceneMode = 'Columbus';
      } else if (mode === Cesium.SceneMode.SCENE2D) {
        this.$viewerService.viewer.scene.morphToColumbusView();
        sceneMode = Cesium.SceneMode.COLUMBUS_VIEW;
        nextSceneMode = '3D';
      } else if (mode === Cesium.SceneMode.COLUMBUS_VIEW) {
        this.$viewerService.viewer.scene.morphTo3D();
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
      reportError(error);
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
      reportError(error);
    }
  }
}
