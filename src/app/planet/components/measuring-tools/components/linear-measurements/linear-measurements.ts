import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import * as Cesium from 'cesium';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MeasureService } from '@/common/services/measure-service/measure.service';
import { LinearMeasurementsModal } from '@/components/measuring-tools/components/linear-measurements/components/linear-measurements-modal/linear-measurements-modal';

@Component({
  selector: 'linear-measurements',
  imports: [LinearMeasurementsModal, MatButtonModule, MatIconModule],
  template: `
    <button
      title="Линейные измерения"
      class="masuring-tool-button"
      matButton="tonal"
      (mousedown)="buttonHandler($event)"
      [disabled]="!isActive() && $measureService.measuresBlocker()"
    >
      <mat-icon>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M3 5v16h6v-1.5H7V18h2v-1.5H5V15h4v-1.5H7V12h2v-1.5H5V9h4V5h1.5v4H12V7h1.5v2H15V5h1.5v4H18V7h1.5v2H21V3H5a2 2 0 0 0-2 2m3 2a1 1 0 0 1-1-1a1 1 0 0 1 1-1a1 1 0 0 1 1 1a1 1 0 0 1-1 1"
          />
        </svg>
      </mat-icon>
    </button>

    @if (this.$measureService.linearMesurmentsLinesList().length) {
      <linear-measurements-modal />
    }
  `,
  styleUrls: ['../../measuring-tools.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinearMeasurements {
  constructor(protected $measureService: MeasureService) {}
  protected isActive = signal<boolean>(false);
  private handler = signal<Cesium.ScreenSpaceEventHandler | undefined>(undefined);
  protected buttonHandler(event: MouseEvent): void {
    if (event.button === 0) {
      this.toggleDrawing();
    } else if (event.button === 1) {
      if (this.$measureService.lineMeasureHasStarted() === false) {
        this.$measureService.allToolEntitiesCleaning('linearMeasurements');
      } else {
        alert('Сначала закончите построение');
      }
    }
  }
  private toggleDrawing(): void {
    try {
      if (this.isActive() === false) {
        this.isActive.set(true);
        this.$measureService.drawLineMeasureGraphics({
          toolName: 'linearMeasurements',
          name: 'linear-measurements',
          reuse: true,
        });
        this.handler.set(
          new Cesium.ScreenSpaceEventHandler(this.$measureService._viewer.scene.canvas),
        );
        this.handler()?.setInputAction(() => {
          if (this.$measureService.lineMeasureHasStarted() === false) {
            this.cancelTool();
          }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      } else if (this.isActive() === true) {
        if (this.$measureService.lineMeasureHasStarted() === true) {
          this.$measureService.removeTemporalEntities();
        }
        this.cancelTool();
      }
    } catch (error) {
      console.log(error);
      this.cancelTool();
    }
  }
  public cancelByEsc(): void {
    this.$measureService.removeTemporalEntities();
    this.cancelTool();
  }
  private cancelTool(): void {
    this.$measureService.cancelTool();
    this.$measureService.setLineMeasureHasStarted(false);
    this.isActive.set(false);
    if (this.handler() !== undefined) {
      this.handler()?.destroy();
      this.handler.set(undefined);
    }
  }
}
