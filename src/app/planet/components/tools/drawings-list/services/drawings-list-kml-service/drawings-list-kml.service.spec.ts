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

describe('DrawingsListKmlService', () => {
  let service: DrawingsListKmlService;

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
    service = TestBed.inject(DrawingsListKmlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('exportAllToKml alerts when CustomDataSource has no entities', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const emptyLayer = new Cesium.CustomDataSource('empty-export-layer');

    const result = await service.exportAllToKml(false, emptyLayer);

    expect(result).toBe(false);
    expect(alertSpy).toHaveBeenCalledWith('Сущностей для экспорта не обнаружено');
    alertSpy.mockRestore();
  });

  it('exportAllToKml downloads KML containing TestMark for a drawMark point entity', async () => {
    const blobs: Blob[] = [];
    const createUrlSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation((obj) => {
      blobs.push(obj as Blob);
      return 'blob:test';
    });
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const layer = new Cesium.CustomDataSource('export-layer');
    const entity = new Cesium.Entity({
      id: 'g1-drawMark-point-1',
      name: 'TestMark',
      position: Cesium.Cartesian3.fromDegrees(37.6, 55.7),
      point: {
        pixelSize: 8,
        color: Cesium.Color.YELLOW,
      },
    });
    // @ts-expect-error Sight custom property on Entity
    entity.toolName = 'drawMark';
    layer.entities.add(entity);

    const result = await service.exportAllToKml(false, layer);

    expect(result).toBe(true);
    expect(clickSpy).toHaveBeenCalled();
    expect(blobs[0]).toBeInstanceOf(Blob);
    const kmlText = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blobs[0]);
    });
    expect(kmlText).toContain('TestMark');

    createUrlSpy.mockRestore();
    revokeSpy.mockRestore();
    clickSpy.mockRestore();
  });

  it('prepareKmlEntities strips javascript: from parsed entity.name', () => {
    const $toolsService = TestBed.inject(ToolsService);
    vi.spyOn($toolsService, 'setClampingToGroudForEntity').mockImplementation(() => true);
    const maliciousName = 'javascript:alert(1)';
    const payload = JSON.stringify({
      toolName: 'drawMark',
      id: 'g1-drawMark-point-1',
      name: maliciousName,
      show: true,
    });
    const entity = new Cesium.Entity({
      id: 'g1-drawMark-point-1',
      description: `<div class="cesium-infoBox-description-lighter">${payload}</div>`,
    });

    const parsed = (service as any).prepareKmlEntities([entity]);

    expect(parsed).toBeTruthy();
    expect(String(entity.name ?? '')).not.toMatch(/javascript:/i);
  });

  it('prepareKmlEntities keeps a plain entity.name', () => {
    const $toolsService = TestBed.inject(ToolsService);
    vi.spyOn($toolsService, 'setClampingToGroudForEntity').mockImplementation(() => true);
    const payload = JSON.stringify({
      toolName: 'drawMark',
      id: 'g1-drawMark-point-2',
      name: 'TestMark',
      show: true,
    });
    const entity = new Cesium.Entity({
      id: 'g1-drawMark-point-2',
      description: `<div class="cesium-infoBox-description-lighter">${payload}</div>`,
    });

    (service as any).prepareKmlEntities([entity]);

    expect(entity.name).toBe('TestMark');
  });

  it('prepareKmlEntities does not apply javascript: as billboard.image', () => {
    const $toolsService = TestBed.inject(ToolsService);
    vi.spyOn($toolsService, 'setClampingToGroudForEntity').mockImplementation(() => true);
    const payload = JSON.stringify({
      toolName: 'drawMark',
      id: 'g1-drawMark-point-3',
      name: 'Mark',
      show: true,
      billboard: { image: 'javascript:alert(1)' },
    });
    const entity = new Cesium.Entity({
      id: 'g1-drawMark-point-3',
      description: `<div class="cesium-infoBox-description-lighter">${payload}</div>`,
    });

    (service as any).prepareKmlEntities([entity]);

    const image = entity.billboard?.image?.getValue?.() ?? entity.billboard?.image;
    expect(String(image ?? '')).not.toMatch(/javascript:/i);
  });
});
