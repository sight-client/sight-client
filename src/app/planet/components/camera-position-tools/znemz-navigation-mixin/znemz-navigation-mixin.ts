import {
  ChangeDetectionStrategy,
  Component,
  effect,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import * as Cesium from 'cesium';
import ViewerCesiumNavigationMixin from '@znemz/cesium-navigation';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { DeviceService } from '@global/services/device-service/device.service';

@Component({
  selector: 'znemz-navigation-mixin',
  imports: [],
  template: '<div id="navigationMixinWrapper"></div>',
  styleUrl: './znemz-navigation-mixin.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZnemzNavigationMixin {
  constructor(
    private $viewerService: ViewerService,
    private $deviceService: DeviceService,
  ) {
    effect(() => {
      if (this.$viewerService.cameraIsFlyingAround() === true) {
        const navigationControlsDiv: Element =
          document.getElementsByClassName('navigation-controls')[0];
        if (navigationControlsDiv) {
          navigationControlsDiv?.classList.add('navigation-controls-blocked');
        }
        const compassDiv: Element = document.getElementsByClassName('compass')[0];
        if (compassDiv) {
          compassDiv?.classList.add('compass-blocked');
        }
      } else {
        const navigationControlsDiv: Element =
          document.getElementsByClassName('navigation-controls')[0];
        if (navigationControlsDiv) {
          navigationControlsDiv?.classList.remove('navigation-controls-blocked');
        }
        const compassDiv: Element = document.getElementsByClassName('compass')[0];
        if (compassDiv) {
          compassDiv?.classList.remove('compass-blocked');
        }
      }
    });

    effect(() => {
      if (this.$viewerService.viewerHasLoaded() && !this.$deviceService.isMobile) {
        // не работает на точпадах, даже с эмуляцией событий мыши
        untracked(() => {
          this.setNavMixin();
          this.replaceNavMixin();
          this.translateNavMixin();
          this.getUsability();
          this.getCursorListeners();
        });
      } else {
        const navigationMixinDiv = document?.getElementsByClassName(
          'cesium-widget-cesiumNavigationContainer',
        )?.[0];
        if (navigationMixinDiv) navigationMixinDiv.remove();
      }
    });
  }

  private setNavMixin(): void {
    try {
      const mixinOptions: {
        enableCompass: boolean;
        enableCompassOuterRing: boolean;
        enableZoomControls: boolean;
        defaultResetView: Cesium.Cartographic;
        enableDistanceLegend: boolean;
        distanceLabelFormatter: Function;
      } = {
        enableCompass: true,
        enableCompassOuterRing: true,
        enableZoomControls: true,
        defaultResetView: Cesium.Cartographic.fromCartesian(
          this.$viewerService.startCamDestination,
        ),
        enableDistanceLegend: false,
        distanceLabelFormatter: this.distanceLabelFormatter,
      };
      /* Подключение миксина к вьюеру (в #cesiumContainer) - по умолчанию в новый контейнер класса 'cesium-widget-[контейнер миксина]',
          который состоит из #distanceLegendDiv (с .distance-legend) и #navigationDiv (с .compass и .navigation-controls) */
      this.$viewerService.viewer.extend(ViewerCesiumNavigationMixin, mixinOptions);
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }

  private distanceLabelFormatter(length: number, units: string): string {
    try {
      const UNITS_TO_ABBREVIATION: {
        [key: string]: string;
      } = {
        meters: 'м',
        kilometers: 'км',
      };
      const fixed = 0;
      const unitsRes = length < 1 ? 'meters' : units;
      const lengthRes = length < 1 ? Math.round(length * 1000) : length;
      return `${lengthRes.toFixed(fixed)} ${UNITS_TO_ABBREVIATION[unitsRes]}`;
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }

  private replaceNavMixin(): void {
    try {
      document.getElementById('navigationDiv')?.classList.add('navigationMixinDiv');
      /* Перенаправление контейнера с миксином в шаблон настоящего компонента */
      const navigationMixinDiv = document.getElementsByClassName(
        'cesium-widget-cesiumNavigationContainer',
      )[0];
      document.getElementById('navigationMixinWrapper')?.appendChild(navigationMixinDiv);
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }

  private translateNavMixin(): void {
    try {
      // Отключено, т.к. выбивается из общего использования matTooltip заместо title-атрибута
      // document
      //   .getElementsByClassName('compass-outer-ring')[0]
      //   .setAttribute('title', 'Нажмите и тащите чтобы вращать камеру.');
      // document
      //   .getElementsByClassName('compass')[0]
      //   .setAttribute(
      //     'title',
      //     'Внешнее кольцо: вращение камеры. Внутренний гироскоп: свободный обзор.',
      //   );
      // document
      //   .getElementsByClassName('navigation-controls')[0]
      //   .children[0].setAttribute('title', 'Приблизить');
      // document
      //   .getElementsByClassName('navigation-controls')[0]
      //   .children[1].setAttribute('title', 'Вернуть начальный вид');
      // document
      //   .getElementsByClassName('navigation-controls')[0]
      //   .children[2].setAttribute('title', 'Отдалить');
      // document.getElementById('distanceLegendDiv')!.title = 'Длина отрезка на текущей высоте камеры';

      document.getElementsByClassName('compass-outer-ring')[0].removeAttribute('title');
      document.getElementsByClassName('compass')[0].removeAttribute('title');
      document
        .getElementsByClassName('navigation-controls')[0]
        .children[0].removeAttribute('title');
      document
        .getElementsByClassName('navigation-controls')[0]
        .children[1].removeAttribute('title');
      document
        .getElementsByClassName('navigation-controls')[0]
        .children[2].removeAttribute('title');
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }

  private getUsability(): void {
    try {
      const zoomIn: Element = document.getElementsByClassName('navigation-control')[0];
      const resetView: Element = document.getElementsByClassName('navigation-control')[1];
      const zoomOut: Element = document.getElementsByClassName('navigation-control-last')[0];
      if (zoomIn && resetView && zoomOut) {
        const btnsArr = [zoomIn, resetView, zoomOut];
        for (const btn of btnsArr) {
          btn.setAttribute('tabindex', '0');
          (btn as HTMLElement).addEventListener('keyup', (event: KeyboardEvent) => {
            if (event.code === 'Enter' || event.code === 'NumpadEnter') {
              (btn as HTMLElement).click();
            }
          });
        }
      }
    } catch (error: any) {
      error.cause = 'red';
      throw error;
    }
  }

  private getCursorListeners(): void {
    const compassRingEl: HTMLElement | null = document.getElementsByClassName(
      'compass-outer-ring-background',
    )?.[0] as HTMLElement;
    function mouseUpCallback(): void {
      document.body.style.cursor = 'auto';
      document.removeEventListener('mouseup', mouseUpCallback);
    }
    if (compassRingEl) {
      compassRingEl.addEventListener('mousedown', () => {
        document.body.style.cursor = 'grabbing';
        document.addEventListener('mouseup', mouseUpCallback);
      });
    }
    const compassGyroEl: HTMLElement | null = document.getElementsByClassName(
      'compass-gyro-background',
    )?.[0] as HTMLElement;
    if (compassGyroEl) {
      compassGyroEl.addEventListener('mousedown', () => {
        document.body.style.cursor = 'move';
        document.addEventListener('mouseup', mouseUpCallback);
      });
    }
  }
}
