import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import * as Cesium from 'cesium';

import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MeasureService } from '@/common/services/measure-service/measure.service';

@Component({
  selector: 'add-mark',
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatInputModule],
  template: `
    <button
      title="Метки"
      class="masuring-tool-button"
      matButton="tonal"
      (mousedown)="buttonHandler($event)"
      [disabled]="!isActive() && $measureService.measuresBlocker()"
    >
      <mat-icon>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5"
          />
        </svg>
      </mat-icon>
    </button>
  `,
  styleUrls: ['../../measuring-tools.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMark {
  constructor(protected $measureService: MeasureService) {}
  protected isActive = signal<boolean>(false);
  private handler = signal<Cesium.ScreenSpaceEventHandler | undefined>(undefined);
  protected buttonHandler(event: MouseEvent): void {
    if (event.button === 0) {
      this.toggleMarkAddition();
    } else if (event.button === 1) {
      this.$measureService.allToolEntitiesCleaning(
        'add-mark',
        this.$measureService.marksList,
        'measureLayer',
      );
    }
  }
  private toggleMarkAddition(): void {
    try {
      if (this.isActive() === false) {
        this.isActive.set(true);
        this.$measureService.drawPointGraphics({
          id: 'add-mark',
          reuse: true,
          toolName: 'Метки',
          withCoordsDesc: true,
          withoutHeightDesc: true,
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
