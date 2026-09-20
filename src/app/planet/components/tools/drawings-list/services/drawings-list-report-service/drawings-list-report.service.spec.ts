import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';

import * as Cesium from 'cesium';
import type { OdsDocumentModel } from 'odf-kit/ods-reader';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { CursorCoordsService } from '@/common/services/cursor-coords-service/cursor-coords.service';
import { SetProgressSpinnerService } from '@global/services/set-progress-spinner-service/set-progress-spinner.service';
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
    flyTo: vi.fn().mockResolvedValue(undefined),
    setNewPickedEntity: vi.fn(),
  } as unknown as ViewerService;
}

describe('DrawingsListReportService', () => {
  let service: DrawingsListReportService;

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
    service = TestBed.inject(DrawingsListReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('provideReport alerts Developer error when drawingStores was never started', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const spinner = TestBed.inject(SetProgressSpinnerService);
    const onSpy = vi.spyOn(spinner, 'setSpinnerOn');
    const offSpy = vi.spyOn(spinner, 'setSpinnerOff');

    await service.provideReport();

    expect(onSpy).toHaveBeenCalled();
    expect(offSpy).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Developer error');
    alertSpy.mockRestore();
  });

  it('provideReport triggers ODS download for one drawMark group', async () => {
    const drawingsListService = TestBed.inject(DrawingsListService);
    const drawingService = TestBed.inject(DrawingService);
    const cursorCoords = TestBed.inject(CursorCoordsService);
    cursorCoords.selectedCrs.set('WGS-84');

    drawingsListService.startDrawingsListService();

    const position = Cesium.Cartesian3.fromDegrees(37.6173, 55.7558, 0);
    const entity = new Cesium.Entity({
      id: 'g1-drawMark-point-1',
      name: 'TestMark',
      position,
    });
    drawingService.pushGroupWithoutTemporal([entity], 'g1', 'drawMark', entity);

    const blobs: Blob[] = [];
    const createUrlSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation((obj) => {
      blobs.push(obj as Blob);
      return 'blob:test-ods';
    });
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    await service.provideReport();

    expect(alertSpy).not.toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(blobs.length).toBeGreaterThan(0);
    expect(blobs[0].type).toContain('opendocument');

    alertSpy.mockRestore();
    createUrlSpy.mockRestore();
    revokeSpy.mockRestore();
    clickSpy.mockRestore();
  });

  it('getPseudoEntitiesFromReport maps SK-42 m GK meters to finite WGS-84 Cartesian3', () => {
    const model = {
      sheets: [
        {
          name: 'Метка',
          rows: [
            {
              index: 0,
              cells: [
                { colIndex: 0, type: 'string', value: 'Наименование инструмента' },
                { colIndex: 1, type: 'string', value: 'Широта' },
                { colIndex: 2, type: 'string', value: 'Долгота' },
                { colIndex: 3, type: 'string', value: 'Высота, м' },
                { colIndex: 4, type: 'string', value: 'СК' },
              ],
            },
            {
              index: 1,
              cells: [
                { colIndex: 0, type: 'string', value: 'Mark1' },
                { colIndex: 1, type: 'float', value: 6180000 },
                { colIndex: 2, type: 'float', value: 7376173 },
                { colIndex: 3, type: 'float', value: 0 },
                { colIndex: 4, type: 'string', value: 'СК-42 м' },
              ],
            },
          ],
        },
      ],
    } as unknown as OdsDocumentModel;

    const result = (
      service as unknown as {
        getPseudoEntitiesFromReport: (
          m: OdsDocumentModel,
        ) => Array<{ toolName: string; entitiesList: Array<{ position?: Cesium.Cartesian3 }> }>;
      }
    ).getPseudoEntitiesFromReport(model);

    expect(result?.length).toBe(1);
    expect(result?.[0].toolName).toBe('drawMark');
    const position = result?.[0].entitiesList[0]?.position;
    expect(position).toBeInstanceOf(Cesium.Cartesian3);
    expect(Number.isFinite(position!.x)).toBe(true);
    expect(Number.isFinite(position!.y)).toBe(true);
    expect(Number.isFinite(position!.z)).toBe(true);
  });
});
