import { afterNextRender, Directive, effect, ElementRef, inject, untracked } from '@angular/core';
import * as Cesium from 'cesium';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { MouseCoordsService } from '@/common/services/mouse-coords-service/mouse-coords.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { ToolsListService } from '@/components/tools/tools-list/services/tools-list-service/tools-list.service';

@Directive({
  selector: '[appCesiumDirective]',
})
export class AppCesiumDirective {
  constructor(
    private $viewerService: ViewerService,
    private $mouseCoordsService: MouseCoordsService,
    private $toolsService: ToolsService,
    private $toolsListService: ToolsListService,
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
          // console.log('viewer has loaded, MouseCoordsService have started');
        });
      }
    });
    effect(() => {
      if (this.$mouseCoordsService.underMouseEntityHasLoaded()) {
        untracked(async () => {
          await this.$toolsService.startToolsService();
          // console.log('MouseCoordsService has loaded, StartToolsService have started');
        });
      }
    });
    effect(() => {
      if (this.$toolsService.toolsServiceHasStarted()) {
        untracked(() => {
          this.$toolsListService.startToolsListService();
          // console.log('ToolsListService has loaded, StartToolsListService have started');
        });
      }
    });
  }
}
