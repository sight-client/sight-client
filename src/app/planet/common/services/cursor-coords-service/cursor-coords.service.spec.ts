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

describe('CursorCoordsService on desktop', () => {
  let service: CursorCoordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CursorCoordsService,
        { provide: ViewerService, useValue: {} },
        {
          provide: CheckMobileDeviceService,
          useValue: { checkMobile: () => false, isMobile: false },
        },
      ],
    });
    service = TestBed.inject(CursorCoordsService);
  });

  it('getCursorXY without a canvas returns undefined', () => {
    expect(service.getCursorXY()).toBeUndefined();
  });

  it('setSelectedCrs updates selectedCrs', async () => {
    await service.setSelectedCrs('СК-42 м');
    expect(service.selectedCrs()).toBe('СК-42 м');
  });

  it('startCursorCoordsService throws when scene canvas is missing', async () => {
    await expect(service.startCursorCoordsService()).rejects.toThrow('Scene canvas is undefined!');
  });
});
