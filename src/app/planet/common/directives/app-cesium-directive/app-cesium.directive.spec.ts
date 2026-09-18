import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';

import { AppCesiumDirective } from './app-cesium.directive';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { MouseCoordsService } from '@/common/services/mouse-coords-service/mouse-coords.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { ToolsListService } from '@/components/tools/tools-list/services/tools-list-service/tools-list.service';

@Component({
  template: '<div appCesiumDirective></div>',
  imports: [AppCesiumDirective],
})
class AppCesiumHost {}

describe('AppCesiumDirective', () => {
  it('should create', () => {
    TestBed.configureTestingModule({
      imports: [AppCesiumHost],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ViewerService,
          useValue: {
            viewerHasLoaded: signal(false),
            getNewViewer: () => {},
            setImageryProvider: () => {},
          },
        },
        {
          provide: MouseCoordsService,
          useValue: {
            startMouseCoordsService: () => {},
            underMouseEntityHasLoaded: signal(false),
          },
        },
        {
          provide: ToolsService,
          useValue: {
            startToolsService: async () => {},
            toolsServiceHasStarted: signal(false),
          },
        },
        { provide: ToolsListService, useValue: { startToolsListService: () => {} } },
      ],
    });

    const fixture = TestBed.createComponent(AppCesiumHost);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
