import { afterNextRender, Directive, effect, ElementRef, inject, untracked } from '@angular/core';
import * as Cesium from 'cesium';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { CursorCoordsService } from '@/common/services/cursor-coords-service/cursor-coords.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { DrawingsListService } from '@/components/tools/drawings-list/services/drawings-list-service/drawings-list.service';

@Directive({
  selector: '[runViewerDirective]',
})
export class RunViewerDirective {
  constructor(
    private $viewerService: ViewerService,
    private $cursorCoordsService: CursorCoordsService,
    private $toolsService: ToolsService,
    private $drawingsListService: DrawingsListService,
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
          this.$cursorCoordsService.startCursorCoordsService();
          // console.log('viewer has loaded, CursorCoordsService have started');
        });
      }
    });
    effect(() => {
      if (this.$cursorCoordsService.underMouseEntityHasLoaded()) {
        untracked(async () => {
          await this.$toolsService.startToolsService();
          // console.log('CursorCoordsService has loaded, StartToolsService have started');
        });
      }
    });
    effect(() => {
      if (this.$toolsService.toolsServiceHasStarted()) {
        untracked(() => {
          this.$drawingsListService.startDrawingsListService();
          // console.log('DrawingsListService has loaded, StartDrawingsListService have started');
        });
      }
    });
  }
}
