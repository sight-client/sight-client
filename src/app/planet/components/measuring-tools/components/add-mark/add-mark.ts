import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import * as Cesium from 'cesium';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MeasureService } from '@/common/services/measure-service/measure.service';

import { AddMarkModal } from '@/components/measuring-tools/components/add-mark/components/add-mark-modal/add-mark-modal';

@Component({
  selector: 'add-mark',
  imports: [AddMarkModal, MatButtonModule, MatIconModule],
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

    @if (this.$measureService.marksList().length) {
      <add-mark-modal />
    }
  `,
  styleUrls: ['../../measuring-tools.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMark {
  // Логика данного компонента ограничивается организацией нанесения точек на холст. Логика его модального окна - в его соответствующем дочернем компоненте.
  constructor(protected $measureService: MeasureService) {}
  protected isActive = signal<boolean>(false);
  private handler = signal<Cesium.ScreenSpaceEventHandler | undefined>(undefined);
  protected buttonHandler(event: MouseEvent): void {
    if (event.button === 0) {
      this.toggleMarkAddition();
    } else if (event.button === 1) {
      this.$measureService.allToolEntitiesCleaning('addMark');
    }
  }
  private toggleMarkAddition(): void {
    try {
      if (this.isActive() === false) {
        this.isActive.set(true);
        this.$measureService.drawPointGraphics({
          toolName: 'addMark', // important!
          name: 'add-mark',
          reuse: true,
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
  // Активируется из родителя (событие Esc)
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
