import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';

import * as Cesium from 'cesium';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { CursorCoordsService } from '@/common/services/cursor-coords-service/cursor-coords.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { DrawingService } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { MeasureService } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import { CameraViewToolsService } from '@/components/tools/camera-view-tools/services/camera-view-tools-service/camera-view-tools.service';
import { DrawMarkService } from '@/components/tools/drawing-tools/components/draw-mark/services/draw-mark-service/draw-mark.service';
import { DrawLineService } from '@/components/tools/drawing-tools/components/draw-line/services/draw-line-service/draw-line.service';
import { DrawRectangleService } from '@/components/tools/drawing-tools/components/draw-rectangle/services/draw-rectangle-service/draw-rectangle.service';
import { DrawCircleService } from '@/components/tools/drawing-tools/components/draw-circle/services/draw-circle-service/draw-circle.service';
import { DrawPolygonService } from '@/components/tools/drawing-tools/components/draw-polygon/services/draw-polygon-service/draw-polygon.service';
import { EntityRubberService } from '@/components/tools/drawing-tools/components/entity-rubber/services/entity-rubber.service';
import { CalculateLineService } from '@/components/tools/measuring-tools/components/calculate-line/services/calculate-line-service/calculate-line.service';
import { CalculateRectangleService } from '@/components/tools/measuring-tools/components/calculate-rectangle/services/calculate-rectangle-service/calculate-rectangle.service';
import { CalculateCircleService } from '@/components/tools/measuring-tools/components/calculate-circle/services/calculate-circle-service/calculate-circle.service';
import { CalculatePolygonService } from '@/components/tools/measuring-tools/components/calculate-polygon/services/calculate-polygon-service/calculate-polygon.service';
import { FlyAroundService } from '@/components/tools/camera-view-tools/components/fly-around/services/fly-around-service/fly-around.service';
import { FloatingWindowsService } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';
import { DrawingsListService } from '@/components/tools/drawings-list/services/drawings-list-service/drawings-list.service';
import { DrawingsListKmlService } from '@/components/tools/drawings-list/services/drawings-list-kml-service/drawings-list-kml.service';
import { DrawingsListReportService } from '@/components/tools/drawings-list/services/drawings-list-report-service/drawings-list-report.service';
import { DrawMarkFloatingWindowService } from '@/components/tools/drawing-tools/components/draw-mark/components/draw-mark-floating-window/services/draw-mark-floating-window-service/draw-mark-floating-window.service';
import { DrawLineFloatingWindowService } from '@/components/tools/drawing-tools/components/draw-line/components/draw-line-floating-window/services/draw-line-floating-window-service/draw-line-floating-window.service';
import { DrawRectangleFloatingWindowService } from '@/components/tools/drawing-tools/components/draw-rectangle/components/draw-rectangle-floating-window/services/draw-rectangle-floating-window-service/draw-rectangle-floating-window.service';
import { DrawCircleFloatingWindowService } from '@/components/tools/drawing-tools/components/draw-circle/components/draw-circle-floating-window/services/draw-circle-floating-window-service/draw-circle-floating-window.service';
import { DrawPolygonFloatingWindowService } from '@/components/tools/drawing-tools/components/draw-polygon/components/draw-polygon-floating-window/services/draw-polygon-floating-window-service/draw-polygon-floating-window.service';
import { CalculateLineFloatingWindowService } from '@/components/tools/measuring-tools/components/calculate-line/components/calculate-line-floating-window/services/calculate-line-floating-window-service/calculate-line-floating-window.service';
import { CalculateRectangleFloatingWindowService } from '@/components/tools/measuring-tools/components/calculate-rectangle/components/calculate-rectangle-floating-window/services/calculate-rectangle-floating-window-service/calculate-rectangle-floating-window.service';
import { CalculateCircleFloatingWindowService } from '@/components/tools/measuring-tools/components/calculate-circle/components/calculate-circle-floating-window/services/calculate-circle-floating-window-service/calculate-circle-floating-window.service';
import { CalculatePolygonFloatingWindowService } from '@/components/tools/measuring-tools/components/calculate-polygon/components/calculate-polygon-floating-window/services/calculate-polygon-floating-window-service/calculate-polygon-floating-window.service';
import { FlyAroundFloatingWindowService } from '@/components/tools/camera-view-tools/components/fly-around/components/fly-around-floating-window/services/fly-around-floating-window-service/fly-around-floating-window.service';
import { CheckMobileDeviceService } from '@global/services/check-mobile-device-service/check-mobile-device.service';

const phoneLayout = signal(false);
const laptopLayout = signal(false);
const narrowChromeLayout = signal(false);

function fakeViewerService(overrides: Partial<{ viewer: object }> = {}) {
  return {
    viewer: {
      scene: {
        canvas: document.createElement('canvas'),
        mode: Cesium.SceneMode.SCENE3D,
        camera: {
          changed: { addEventListener: () => {}, removeEventListener: () => {} },
          pitch: 0,
          positionCartographic: { height: 0 },
        },
      },
      camera: {
        changed: { addEventListener: () => {} },
        moveEnd: { addEventListener: () => {} },
      },
      dataSources: { getByName: () => [] },
      forcedPickedEntity: signal(undefined),
      extend: () => {},
      ...overrides.viewer,
    },
    viewerHasLoaded: signal(false),
    clampToGroundSignal: signal(true),
    nowSceneMode: signal(Cesium.SceneMode.SCENE3D),
    nowSceneModeDescription: signal<'3D' | '2D' | 'Columbus'>('3D'),
    cameraIsFlyingAround: signal(false),
    forcedEntityPickingEffectFlag: signal(false),
    distanceSegmentLengthM: 100,
    setClampToGround: () => {},
    setNowSceneMode: () => {},
    setCameraFlyingAroundFlag: () => {},
    getNewViewer: () => {},
    setImageryProvider: () => {},
  } as unknown as ViewerService;
}

describe('FloatingWindowsService', () => {
  let service: FloatingWindowsService;

  beforeEach(() => {
    phoneLayout.set(false);
    laptopLayout.set(false);
    narrowChromeLayout.set(false);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: CheckMobileDeviceService,
          useValue: {
            isMobile: false,
            checkMobile: () => false,
            phoneLayout,
            laptopLayout,
            narrowChromeLayout,
          },
        },
        { provide: ViewerService, useValue: fakeViewerService() },
        CursorCoordsService,
        ToolsService,
        DrawingService,
        MeasureService,
        CameraViewToolsService,
        DrawMarkService,
        DrawLineService,
        DrawRectangleService,
        DrawCircleService,
        DrawPolygonService,
        EntityRubberService,
        CalculateLineService,
        CalculateRectangleService,
        CalculateCircleService,
        CalculatePolygonService,
        FlyAroundService,
        FloatingWindowsService,
        DrawingsListService,
        DrawingsListKmlService,
        DrawingsListReportService,
        DrawMarkFloatingWindowService,
        DrawLineFloatingWindowService,
        DrawRectangleFloatingWindowService,
        DrawCircleFloatingWindowService,
        DrawPolygonFloatingWindowService,
        CalculateLineFloatingWindowService,
        CalculateRectangleFloatingWindowService,
        CalculateCircleFloatingWindowService,
        CalculatePolygonFloatingWindowService,
        FlyAroundFloatingWindowService,
      ],
    });
    service = TestBed.inject(FloatingWindowsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('creates expanded on the right when chrome is wide', () => {
    phoneLayout.set(false);
    narrowChromeLayout.set(false);
    service.addWindowItem('drawMark');
    const item = service.floatingWindowsList()[0];
    expect(item?.collapsed()).toBe(false);
    expect(item?.right).toBe(33);
    expect(item?.left).toBeUndefined();
  });

  it('creates expanded on the left when tabs are top-right', () => {
    phoneLayout.set(false);
    laptopLayout.set(true);
    narrowChromeLayout.set(true);
    service.addWindowItem('drawMark');
    const item = service.floatingWindowsList()[0];
    expect(item?.collapsed()).toBe(false);
    expect(item?.left).toBe(15);
    expect(item?.right).toBeUndefined();
    expect(item?.top).toBe(50);
  });

  it('creates collapsed on phoneLayout', () => {
    phoneLayout.set(true);
    laptopLayout.set(true);
    narrowChromeLayout.set(true);
    service.addWindowItem('drawMark');
    const item = service.floatingWindowsList()[0];
    expect(item?.collapsed()).toBe(true);
    expect(item?.left).toBe(15);
    expect(item?.top).toBe(86);
  });

  it('adds a window keyed by toolName and can hide it', () => {
    service.addWindowItem('drawMark');
    const items = service.floatingWindowsList();
    expect(items.some((w) => w?.windowName === 'drawMark')).toBe(true);
    const item = items.find((w) => w?.windowName === 'drawMark');
    expect(item?.hidden()).toBe(false);
    expect(item?.collapsed()).toBe(false);
    expect(item?.isActive()).toBe(true);
    service.hideWindowByToolName('drawMark', new MouseEvent('click'));
    expect(item?.hidden()).toBe(true);
  });

  it('deleteWindowItem removes the window from the list', () => {
    service.addWindowItem('drawMark');
    expect(service.floatingWindowsList().some((w) => w?.windowName === 'drawMark')).toBe(true);
    service.deleteWindowItem('drawMark', new MouseEvent('click'));
    expect(service.floatingWindowsList().some((w) => w?.windowName === 'drawMark')).toBe(false);
  });

  it('setActiveWindow marks one window active and clears others', () => {
    service.addWindowItem('drawMark');
    service.addWindowItem('drawLine');
    service.unsetActiveForAllWindows();
    service.setActiveWindow('drawLine');
    const drawMark = service.floatingWindowsList().find((w) => w?.windowName === 'drawMark');
    const drawLine = service.floatingWindowsList().find((w) => w?.windowName === 'drawLine');
    expect(drawLine?.isActive()).toBe(true);
    expect(drawMark?.isActive()).toBe(false);
  });

  it('unsetActiveForAllWindows clears active flags and returns false when empty', () => {
    expect(service.unsetActiveForAllWindows()).toBe(false);
    service.addWindowItem('drawMark');
    expect(service.unsetActiveForAllWindows()).toBe(true);
    const item = service.floatingWindowsList().find((w) => w?.windowName === 'drawMark');
    expect(item?.isActive()).toBe(false);
  });

  it('collapseWindow and expandWindow toggle collapsed and expand unhides', () => {
    service.addWindowItem('drawMark');
    const click = new MouseEvent('click');
    expect(service.collapseWindow(0, click)).toBe(true);
    expect(service.floatingWindowsList()[0]?.collapsed()).toBe(true);
    service.hideWindowByToolName('drawMark', new MouseEvent('click'));
    expect(service.floatingWindowsList()[0]?.hidden()).toBe(true);
    expect(service.expandWindow(0, new MouseEvent('click'))).toBe(true);
    expect(service.floatingWindowsList()[0]?.collapsed()).toBe(false);
    expect(service.floatingWindowsList()[0]?.hidden()).toBe(false);
  });

  it('getWindowHeaderHeight accepts new px values and rejects invalid or unchanged', () => {
    expect(service.getWindowHeaderHeight('abc')).toBe(false);
    expect(service.getWindowHeaderHeight('32px')).toBe(false);
    expect(service.getWindowHeaderHeight('40px')).toBe(true);
    expect(service.windowHeaderHeight).toBe(40);
    expect(service.getWindowHeaderHeight('40px')).toBe(false);
  });
});
