import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  signal,
} from '@angular/core';
import * as Cesium from 'cesium';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { CheckMobileDeviceService } from '@global/services/check-mobile-device-service/check-mobile-device.service';

@Component({
  selector: 'camera-height-tool',
  imports: [],
  template: `
    <div class="camera-height-container">
      <span class="camera-height-text camera-height-text-full">Высота наблюдения:&nbsp;</span>
      <span class="camera-height-text camera-height-text-short" title="Высота камеры"
        >Обзор с:&nbsp;</span
      >
      <input
        type="number"
        name="camera-height-input"
        min="0.1"
        max="35000"
        step="any"
        [value]="camHeightKm()"
        (change)="camFly(+$event.target.value)"
      />
      <span>&nbsp;км</span>
    </div>
  `,
  styles: `
    @use 'media-breakpoints-global';

    .camera-height-text-short {
      display: none;
    }

    .camera-height-container {
      display: flex;
      position: absolute;
      left: 200px;
      bottom: 15px;
      // Как у кнопок инструментов работы с картой
      height: var(--regular-btn-size);
      width: max-content;
      align-items: center;
      justify-content: center;
      background-color: var(--theme-ui-background-color);
      border-radius: 10px 10px 10px 10px;
      padding: 5px 10px 5px 10px;
      box-sizing: border-box;
      outline: 1px solid var(--theme-outline-color);
      z-index: 101;
      span {
        width: max-content;
        user-select: none;
      }
      input {
        flex-grow: 1;
        display: inline-block;
        font-size: 1em;
        width: 5em;
        padding: 2px 5px 2px 5px;
        background-color: var(--theme-inputs-background-color);
      }
    }

    @include media-breakpoints-global.laptop {
      .camera-height-container {
        left: 86px;
        top: 15px;
      }
    }

    @include media-breakpoints-global.mobile {
      .camera-height-container {
        top: calc(15px + env(safe-area-inset-top, 0px));
        bottom: auto;
        white-space: nowrap;
        text-align: left;
        width: var(--phone-height-stack-width, 0px);
        box-sizing: border-box;
        visibility: hidden;
      }

      .camera-height-text-full {
        display: none;
      }

      .camera-height-text-short {
        display: inline;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CameraHeightTool implements OnDestroy {
  private phoneStackWidthObserver?: ResizeObserver;

  constructor(
    private $viewerService: ViewerService,
    private $checkMobileDeviceService: CheckMobileDeviceService,
    private el: ElementRef<HTMLElement>,
  ) {
    afterNextRender(() => {
      const box = this.el.nativeElement.querySelector('.camera-height-container');
      if (!(box instanceof HTMLElement)) return;
      const apply = () => {
        const root = document.getElementById('sightUiContainer');
        const html = document.documentElement;
        if (!root) return;
        if (!this.$checkMobileDeviceService.phoneLayout()) {
          root.style.removeProperty('--phone-height-stack-width');
          html.style.removeProperty('--phone-height-stack-width');
          return;
        }
        const coordsMin =
          parseFloat(root.style.getPropertyValue('--phone-coords-content-width')) ||
          parseFloat(html.style.getPropertyValue('--phone-coords-content-width')) ||
          0;
        if (!coordsMin) return;
        const cs = getComputedStyle(box);
        const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
        const childrenW = [...box.children]
          .filter((el) => getComputedStyle(el).display !== 'none')
          .reduce((sum, el) => sum + el.getBoundingClientRect().width, 0);
        const stackW = Math.ceil(Math.max(childrenW + padX, coordsMin));
        if (!stackW) return;
        const px = `${stackW}px`;
        root.style.setProperty('--phone-height-stack-width', px);
        html.style.setProperty('--phone-height-stack-width', px);
      };
      apply();
      this.phoneStackWidthObserver = new ResizeObserver(apply);
      this.phoneStackWidthObserver.observe(box);
    });
    if (this.$viewerService.viewerHasLoaded()) {
      this.camHeightKm.set(
        Number(
          (
            Cesium.Cartographic.fromCartesian(this.$viewerService.startCamDestination).height / 1000
          ).toFixed(1),
        ),
      );
      this.$viewerService.viewer.scene.camera.changed.addEventListener(this.setCamHeightKm);
      this.camHeightKm.set(
        Math.round(
          Cesium.Cartographic.fromCartesian(this.$viewerService.startCamDestination).height / 1000,
        ),
      );
    }
  }

  ngOnDestroy() {
    this.phoneStackWidthObserver?.disconnect();
    this.$viewerService.viewer.scene.camera.changed.removeEventListener(this.setCamHeightKm);
  }

  protected camHeightKm = signal<number>(2500);

  private setCamHeightKm = () => {
    if (this.$viewerService.viewer.scene.camera.pitch > 0.12) {
      this.camFly(0.1, 0.1, 0.12);
    }
    const newCamHeight: number =
      this.$viewerService.viewer.scene.camera.positionCartographic.height;
    if (newCamHeight < 100) {
      this.camFly(0.1, 0.3);
      this.camHeightKm.set(0.1);
    } else {
      this.camHeightKm.set(Math.round(newCamHeight / 1000));
    }
  };

  protected camFly(
    km: number,
    duration: number = 1.0,
    pitch: number | undefined = undefined,
  ): void {
    try {
      if (typeof km !== 'number') return;
      let height: number = 1;
      if (km < 0.1) height = 100;
      else height = km * 1000;
      const camLongitude = this.$viewerService.viewer.camera.positionCartographic.longitude;
      const camLatitude = this.$viewerService.viewer.camera.positionCartographic.latitude;
      const camHeading = this.$viewerService.viewer.camera.heading;
      const camPitch = pitch || this.$viewerService.viewer.camera.pitch;
      const camRoll = this.$viewerService.viewer.camera.roll;
      this.$viewerService.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromRadians(camLongitude, camLatitude, height),
        maximumHeight: height,
        orientation: {
          heading: camHeading,
          pitch: camPitch,
          roll: camRoll,
        },
        duration: duration,
        complete: () => {
          this.camHeightKm.set(height / 1000);
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
}
