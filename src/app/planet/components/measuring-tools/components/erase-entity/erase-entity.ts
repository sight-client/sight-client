import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import * as Cesium from 'cesium';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MeasureService } from '@/common/services/measure-service/measure.service';

@Component({
  selector: 'erase-entity',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button
      title="Ластик"
      class="masuring-tool-button"
      matButton="tonal"
      (click)="toggleCleaning()"
      [disabled]="!isActive() && $measureService.measuresBlocker()"
    >
      <mat-icon>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M16 11h-1V4c0-1.66-1.34-3-3-3S9 2.34 9 4v7H8c-2.76 0-5 2.24-5 5v5c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-5c0-2.76-2.24-5-5-5m3 10h-2v-3c0-.55-.45-1-1-1s-1 .45-1 1v3h-2v-3c0-.55-.45-1-1-1s-1 .45-1 1v3H9v-3c0-.55-.45-1-1-1s-1 .45-1 1v3H5v-5c0-1.65 1.35-3 3-3h8c1.65 0 3 1.35 3 3z"
          />
        </svg>
      </mat-icon>
    </button>
  `,
  styleUrls: ['../../measuring-tools.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EraseEntity {
  constructor(protected $measureService: MeasureService) {}
  protected isActive = signal<boolean>(false);
  private handler = signal<Cesium.ScreenSpaceEventHandler | undefined>(undefined);
  protected toggleCleaning(): void {
    try {
      if (this.isActive() === false) {
        this.isActive.set(true);
        this.$measureService.entitiesCleaning({
          reuse: true,
        });
        this.handler.set(
          new Cesium.ScreenSpaceEventHandler(this.$measureService._viewer.scene.canvas),
        );
        this.handler()?.setInputAction(() => {
          this.cancelTool();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      } else if (this.isActive() === true) {
        this.cancelTool();
      }
    } catch (error) {
      console.log(error);
      this.cancelTool();
    }
  }
  public cancelByEsc(): void {
    this.cancelTool();
  }
  private cancelTool(): void {
    this.$measureService.cancelTool();
    this.isActive.set(false);
    if (this.handler() !== undefined) {
      this.handler()?.destroy();
      this.handler.set(undefined);
    }
  }
}
