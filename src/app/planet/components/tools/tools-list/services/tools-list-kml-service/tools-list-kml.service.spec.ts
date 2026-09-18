import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';

import * as Cesium from 'cesium';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { MouseCoordsService } from '@/common/services/mouse-coords-service/mouse-coords.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { DrawingService } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { MeasureService } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import { CameraToolsService } from '@/components/tools/camera-tools/services/camera-tools-service/camera-tools.service';
import { AddMarkService } from '@/components/tools/drawing-tools/components/add-mark/services/add-mark-service/add-mark.service';
import { AddLineService } from '@/components/tools/drawing-tools/components/add-line/services/add-line-service/add-line.service';
import { AddRectangleService } from '@/components/tools/drawing-tools/components/add-rectangle/services/add-rectangle-service/add-rectangle.service';
import { AddCircleService } from '@/components/tools/drawing-tools/components/add-circle/services/add-circle-service/add-circle.service';
import { AddPolygonService } from '@/components/tools/drawing-tools/components/add-polygon/services/add-polygon-service/add-polygon.service';
import { EraseEntityService } from '@/components/tools/drawing-tools/components/erase-entity/services/erase-entity.service';
import { LinearMeasurementsService } from '@/components/tools/measuring-tools/components/linear-measurements/services/linear-measurements-service/linear-measurements.service';
import { RectangleAreaMeasurementsService } from '@/components/tools/measuring-tools/components/rectangle-area-measurements/services/rectangle-area-measurements-service/rectangle-area-measurements.service';
import { CircleAreaMeasurementsService } from '@/components/tools/measuring-tools/components/circle-area-measurements/services/circle-area-measurements-service/circle-area-measurements.service';
import { PolygonalAreaMeasurementsService } from '@/components/tools/measuring-tools/components/polygonal-area-measurements/services/polygonal-area-measurements-service/polygonal-area-measurements.service';
import { FlyAroundService } from '@/components/tools/camera-tools/components/fly-around/services/fly-around-service/fly-around.service';
import { FloatingWindowsService } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';
import { ToolsListService } from '@/components/tools/tools-list/services/tools-list-service/tools-list.service';
import { ToolsListKmlService } from '@/components/tools/tools-list/services/tools-list-kml-service/tools-list-kml.service';
import { ToolsListReportService } from '@/components/tools/tools-list/services/tools-list-report-service/tools-list-report.service';
import { AddMarkFloatingWindowService } from '@/components/tools/drawing-tools/components/add-mark/components/add-mark-floating-window/services/add-mark-floating-window-service/add-mark-floating-window.service';
import { AddLineFloatingWindowService } from '@/components/tools/drawing-tools/components/add-line/components/add-line-floating-window/services/add-line-floating-window-service/add-line-floating-window.service';
import { AddRectangleFloatingWindowService } from '@/components/tools/drawing-tools/components/add-rectangle/components/add-rectangle-floating-window/services/add-rectangle-floating-window-service/add-rectangle-floating-window.service';
import { AddCircleFloatingWindowService } from '@/components/tools/drawing-tools/components/add-circle/components/add-circle-floating-window/services/add-circle-floating-window-service/add-circle-floating-window.service';
import { AddPolygonFloatingWindowService } from '@/components/tools/drawing-tools/components/add-polygon/components/add-polygon-floating-window/services/add-polygon-floating-window-service/add-polygon-floating-window.service';
import { LinearMeasurementsFloatingWindowService } from '@/components/tools/measuring-tools/components/linear-measurements/components/linear-measurements-floating-window/services/linear-measurements-floating-window-service/linear-measurements-floating-window.service';
import { RectangleAreaMeasurementsFloatingWindowService } from '@/components/tools/measuring-tools/components/rectangle-area-measurements/components/rectangle-area-measurements-floating-window/services/rectangle-area-measurements-floating-window-service/rectangle-area-measurements-floating-window.service';
import { CircleAreaMeasurementsFloatingWindowService } from '@/components/tools/measuring-tools/components/circle-area-measurements/components/circle-area-measurements-floating-window/services/circle-area-measurements-floating-window-service/circle-area-measurements-floating-window.service';
import { PolygonalAreaMeasurementsFloatingWindowService } from '@/components/tools/measuring-tools/components/polygonal-area-measurements/components/polygonal-area-measurements-floating-window/services/polygonal-area-measurements-floating-window-service/polygonal-area-measurements-floating-window.service';
import { FlyAroundFloatingWindowService } from '@/components/tools/camera-tools/components/fly-around/components/fly-around-floating-window/services/fly-around-floating-window-service/fly-around-floating-window.service';

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

describe('ToolsListKmlService', () => {
  let service: ToolsListKmlService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ViewerService, useValue: fakeViewerService() },
        MouseCoordsService,
        ToolsService,
        DrawingService,
        MeasureService,
        CameraToolsService,
        AddMarkService,
        AddLineService,
        AddRectangleService,
        AddCircleService,
        AddPolygonService,
        EraseEntityService,
        LinearMeasurementsService,
        RectangleAreaMeasurementsService,
        CircleAreaMeasurementsService,
        PolygonalAreaMeasurementsService,
        FlyAroundService,
        FloatingWindowsService,
        ToolsListService,
        ToolsListKmlService,
        ToolsListReportService,
        AddMarkFloatingWindowService,
        AddLineFloatingWindowService,
        AddRectangleFloatingWindowService,
        AddCircleFloatingWindowService,
        AddPolygonFloatingWindowService,
        LinearMeasurementsFloatingWindowService,
        RectangleAreaMeasurementsFloatingWindowService,
        CircleAreaMeasurementsFloatingWindowService,
        PolygonalAreaMeasurementsFloatingWindowService,
        FlyAroundFloatingWindowService,
      ],
    });
    service = TestBed.inject(ToolsListKmlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
