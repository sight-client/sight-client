import { afterNextRender, Directive, effect, ElementRef, inject } from '@angular/core';
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
        this.$viewerService.setImageryProvider(
          new Cesium.OpenStreetMapImageryProvider({
            url: 'https://tile.openstreetmap.org/',
          }),
        );
      }
    });
    effect(() => {
      if (this.$viewerService.viewerHasLoaded()) {
        this.$mouseCoordsService.startMouseCoordsService();
      }
    });
    effect(async () => {
      if (this.$mouseCoordsService.underMouseEntityHasLoaded()) {
        await this.$measureService.startMeasureService();
      }
    });
  }
}
