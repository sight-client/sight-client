import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { DeviceService } from '@global/services/device-service/device.service';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { MouseCoordsService } from './mouse-coords.service';

describe('MouseCoordsService', () => {
  let service: MouseCoordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MouseCoordsService,
        { provide: ViewerService, useValue: {} },
      ],
    });
    service = TestBed.inject(MouseCoordsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

describe('MouseCoordsService on a mobile device', () => {
  let service: MouseCoordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MouseCoordsService,
        { provide: ViewerService, useValue: {} },
        {
          provide: DeviceService,
          useValue: { checkMobile: () => true, isMobile: true },
        },
      ],
    });
    service = TestBed.inject(MouseCoordsService);
    const internals = service as unknown as {
      canvas: HTMLCanvasElement;
      canvasCenterX: number;
      canvasCenterY: number;
    };
    internals.canvas = document.createElement('canvas');
    internals.canvasCenterX = 320;
    internals.canvasCenterY = 240;
  });

  it('sets cursorOnViewerCanvas when resolving the canvas center', () => {
    expect(service.cursorOnViewerCanvas()).toBe(false);

    service.getCursorXY();

    expect(service.cursorOnViewerCanvas()).toBe(true);
  });
});
