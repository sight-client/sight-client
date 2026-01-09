import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import * as Cesium from 'cesium';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MeasureService } from '@/common/services/measure-service/measure.service';

@Component({
  selector: 'linear-measurements',
  imports: [MatButtonModule, MatIconModule],
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
            d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m0 10H3V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2z"
          />
        </svg>
      </mat-icon>
    </button>
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
        this.$measureService.allToolEntitiesCleaning('linear-measurements');
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
          id: 'linear-measurements',
          reuse: true,
          toolName: 'Линейные измерения',
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
        this.cancelTool();
      }
    } catch (error) {
      console.log(error);
      this.cancelTool();
    }
  }
  public cancelByEsc(): void {
    if (this.$measureService.lineMeasureHasStarted() === true) {
      const lastId: string | undefined =
        this.$measureService.linearMesurmentsLinesList()?.[
          this.$measureService.linearMesurmentsLinesList().length - 1
        ]?.id;
      if (!lastId) return;
      this.$measureService.removeEntitiesById(
        lastId,
        this.$measureService.linearMesurmentsLinesList,
      );
    }
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
