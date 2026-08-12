import { afterNextRender, Directive, effect, ElementRef, inject, untracked } from '@angular/core';
import * as Cesium from 'cesium';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { MouseCoordsService } from '@/common/services/mouse-coords-service/mouse-coords.service';
import { MeasureService } from '@/common/services/measure-service/measure.service';

@Directive({
  selector: '[appCesiumDirective]',
})
export class AppCesiumDirective {
  constructor(
    private $viewerService: ViewerService,
    private $mouseCoordsService: MouseCoordsService,
    private $measureService: MeasureService,
  ) {
    const el = inject<ElementRef<Element>>(ElementRef);
    afterNextRender(() => {
      try {
        this.$viewerService.getNewViewer(el.nativeElement);
      } catch (error: any) {
        error.cause = 'red';
        throw error;
      }
    });
    // Гарантия корректной очередности загрузки сервисов работы с Cesium
    effect(() => {
      if (this.$viewerService.viewerHasLoaded()) {
        try {
          this.$viewerService.setImageryProvider(
            new Cesium.OpenStreetMapImageryProvider({
              url: 'https://tile.openstreetmap.org/',
            }),
          );
        } catch (error: any) {
          // error.cause = 'red';
          // throw error;
          console.log(error);
        }
      }
    });
    effect(() => {
      if (this.$viewerService.viewerHasLoaded()) {
        untracked(() => {
          this.$mouseCoordsService.startMouseCoordsService();
        });
      }
    });
    effect(() => {
      if (this.$mouseCoordsService.underMouseEntityHasLoaded()) {
        untracked(async () => {
          await this.$measureService.startMeasureService();
        });
      }
    });
  }
}
