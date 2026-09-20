import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { CheckMobileDeviceService } from '@global/services/check-mobile-device-service/check-mobile-device.service';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { CursorCoordsService } from './cursor-coords.service';

describe('CursorCoordsService', () => {
  let service: CursorCoordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CursorCoordsService,
        { provide: ViewerService, useValue: {} },
      ],
    });
    service = TestBed.inject(CursorCoordsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

describe('CursorCoordsService on a mobile device', () => {
  let service: CursorCoordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CursorCoordsService,
        { provide: ViewerService, useValue: {} },
        {
          provide: CheckMobileDeviceService,
          useValue: { checkMobile: () => true, isMobile: true },
        },
      ],
    });
    service = TestBed.inject(CursorCoordsService);
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
