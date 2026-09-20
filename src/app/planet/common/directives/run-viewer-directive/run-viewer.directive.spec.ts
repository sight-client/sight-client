import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';

import { RunViewerDirective } from './run-viewer.directive';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { CursorCoordsService } from '@/common/services/cursor-coords-service/cursor-coords.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { DrawingsListService } from '@/components/tools/drawings-list/services/drawings-list-service/drawings-list.service';

@Component({
  template: '<div runViewerDirective></div>',
  imports: [RunViewerDirective],
})
class AppCesiumHost {}

describe('RunViewerDirective', () => {
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
          provide: CursorCoordsService,
          useValue: {
            startCursorCoordsService: () => {},
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
        { provide: DrawingsListService, useValue: { startDrawingsListService: () => {} } },
      ],
    });

    const fixture = TestBed.createComponent(AppCesiumHost);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
