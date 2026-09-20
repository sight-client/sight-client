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

function fakeViewerServiceForActivation(overrides: Partial<{ viewer: object }> = {}) {
  return {
    ...fakeViewerService(overrides),
    onEntityPickingBlock: () => {},
    offEntityPickingBlock: () => {},
    setNewPickedEntity: () => {},
  } as unknown as ViewerService;
}

function fakeCursorCoordsServiceForActivation() {
  return {
    cursorOnViewerCanvas: signal(true),
    getCursorXY: () => undefined,
    selectedCrs: signal('WGS-84'),
  } as unknown as CursorCoordsService;
}

function fakeToolsServiceForActivation() {
  const drawingsBlocker = signal(false);
  return {
    drawingsBlockerSignal: drawingsBlocker,
    toolsService: {
      drawingsBlocker,
      setDrawingsBlocker: vi.fn((v: boolean) => drawingsBlocker.set(v)),
      clearCommonHandler: vi.fn(),
      createNewCommonHandler: vi.fn(),
      setCommonHandler: vi.fn(),
      isMobile: false,
      findEntityPathInStore: vi.fn(),
      drawingToolsLayerName: 'drawLayer',
      drawRouteLayerName: 'drawRoute',
    } as unknown as ToolsService,
  };
}

const drawLineServiceProviders = (
  viewer: ViewerService,
  tools: ToolsService,
  cursor: CursorCoordsService,
) => [
  provideZonelessChangeDetection(),
  { provide: ViewerService, useValue: viewer },
  { provide: CursorCoordsService, useValue: cursor },
  { provide: ToolsService, useValue: tools },
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
];

describe('DrawLineService', () => {
  describe('TestBed hygiene', () => {
    let service: DrawLineService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
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
      service = TestBed.inject(DrawLineService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('tool activation', () => {
    let service: DrawLineService;
    let toolsFake: ReturnType<typeof fakeToolsServiceForActivation>;

    beforeEach(() => {
      toolsFake = fakeToolsServiceForActivation();
      TestBed.configureTestingModule({
        providers: drawLineServiceProviders(
          fakeViewerServiceForActivation(),
          toolsFake.toolsService,
          fakeCursorCoordsServiceForActivation(),
        ),
      });
      service = TestBed.inject(DrawLineService);
    });

    it('default isActive() is false', () => {
      expect(service.isActive()).toBe(false);
    });

    it('left click buttonHandler sets isActive() true without throwing', () => {
      service.buttonHandler(new MouseEvent('mousedown', { button: 0 }));
      expect(service.isActive()).toBe(true);
    });

    it('cancelThisTool() sets isActive() false after activation', () => {
      service.buttonHandler(new MouseEvent('mousedown', { button: 0 }));
      expect(service.isActive()).toBe(true);
      service.cancelThisTool();
      expect(service.isActive()).toBe(false);
    });

    it('when drawingsBlocker is true, left click does not activate', () => {
      toolsFake.drawingsBlockerSignal.set(true);
      service.buttonHandler(new MouseEvent('mousedown', { button: 0 }));
      expect(service.isActive()).toBe(false);
    });
  });
});
