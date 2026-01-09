import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';

type SceneModeLiterals = '3D' | '2D' | 'Columbus';

@Component({
  selector: 'scene-mode-changer',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './scene-mode-changer.html',
  styleUrl: './scene-mode-changer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneModeChanger {
  constructor(private $viewerService: ViewerService) {
    const sceneMode: string | null = localStorage.getItem('sceneMode');
    if (sceneMode === '3D' || sceneMode === '2D' || sceneMode === 'Columbus')
      this.nowSceneMode.set(sceneMode);
  }
  protected nowSceneMode = signal<SceneModeLiterals>('3D');
  protected disableChanging = signal<boolean>(false);
  protected changeSceneMode(): void {
    try {
      if (!this.$viewerService.viewerHasLoaded()) return;
      this.disableChanging.set(true);
      let sceneMode: SceneModeLiterals = '3D';
      if (this.$viewerService.viewer.scene.mode === 3) {
        this.$viewerService.viewer.scene.morphTo2D();
        sceneMode = '2D';
      } else if (this.$viewerService.viewer.scene.mode === 2) {
        this.$viewerService.viewer.scene.morphToColumbusView();
        this.nowSceneMode.set('Columbus');
        sceneMode = 'Columbus';
      } else if (this.$viewerService.viewer.scene.mode === 1) {
        this.$viewerService.viewer.scene.morphTo3D();
        this.nowSceneMode.set('3D');
        sceneMode = '3D';
      }
      this.nowSceneMode.set(sceneMode);
      setTimeout(() => this.disableChanging.set(false), 2000); // default duration
      this.setLocalStorageSceneMode(sceneMode);
    } catch (error: unknown) {
      this.disableChanging.set(false);
      console.log(error);
    }
  }
  private setLocalStorageSceneMode(sceneMode: SceneModeLiterals): void {
    try {
      localStorage.setItem('sceneMode', sceneMode);
    } catch (error: unknown) {
      console.log(error);
    }
  }
}
