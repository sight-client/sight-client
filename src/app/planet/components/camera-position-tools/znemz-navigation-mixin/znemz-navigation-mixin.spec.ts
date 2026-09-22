import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';

import * as Cesium from 'cesium';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { CheckMobileDeviceService } from '@global/services/check-mobile-device-service/check-mobile-device.service';
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
import { attachNavigationTouchBridge, ZnemzNavigationMixin } from './znemz-navigation-mixin';

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

describe('ZnemzNavigationMixin', () => {
  let component: ZnemzNavigationMixin;
  let fixture: ComponentFixture<ZnemzNavigationMixin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZnemzNavigationMixin],
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
    }).compileComponents();

    fixture = TestBed.createComponent(ZnemzNavigationMixin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

type RecordedMouseEvent = {
  type: string;
  clientX: number;
  clientY: number;
};

function dispatchTouch(
  type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
  target: EventTarget,
  x: number,
  y: number,
  identifier = 1,
): void {
  const point = { identifier, clientX: x, clientY: y, screenX: x, screenY: y, target };
  const event = new Event(type, { bubbles: true, cancelable: true });
  const active = type === 'touchend' || type === 'touchcancel' ? [] : [point];
  Object.defineProperties(event, {
    touches: { value: active },
    changedTouches: { value: [point] },
  });
  target.dispatchEvent(event);
}

function recordMouse(target: EventTarget, types: string[], into: RecordedMouseEvent[]): void {
  for (const type of types) {
    target.addEventListener(type, (event) => {
      const mouse = event as MouseEvent;
      into.push({ type, clientX: mouse.clientX, clientY: mouse.clientY });
    });
  }
}

describe('attachNavigationTouchBridge', () => {
  let root: HTMLDivElement;
  let compass: HTMLDivElement;
  let zoomIn: HTMLDivElement;
  let detach: () => void;
  let mouse: RecordedMouseEvent[];

  beforeEach(() => {
    root = document.createElement('div');
    compass = document.createElement('div');
    compass.className = 'compass';
    const controls = document.createElement('div');
    controls.className = 'navigation-controls';
    zoomIn = document.createElement('div');
    zoomIn.className = 'navigation-control';
    const reset = document.createElement('div');
    reset.className = 'navigation-control';
    const zoomOut = document.createElement('div');
    zoomOut.className = 'navigation-control-last';
    controls.append(zoomIn, reset, zoomOut);
    root.append(compass, controls);
    document.body.append(root);
    mouse = [];
    recordMouse(compass, ['mousedown', 'dblclick'], mouse);
    recordMouse(document, ['mousemove', 'mouseup'], mouse);
    recordMouse(zoomIn, ['click'], mouse);
    detach = attachNavigationTouchBridge(root);
  });

  afterEach(() => {
    detach();
    root.remove();
  });

  it('turns a compass drag into mousedown, mousemove and mouseup', () => {
    dispatchTouch('touchstart', compass, 40, 50);
    dispatchTouch('touchmove', document, 70, 80);
    dispatchTouch('touchend', document, 70, 80);

    expect(mouse).toEqual([
      { type: 'mousedown', clientX: 40, clientY: 50 },
      { type: 'mousemove', clientX: 70, clientY: 80 },
      { type: 'mouseup', clientX: 70, clientY: 80 },
    ]);
  });

  it('stops translating touchmove after the finger is up', () => {
    dispatchTouch('touchstart', compass, 10, 10);
    dispatchTouch('touchend', document, 10, 10);
    mouse.length = 0;
    dispatchTouch('touchmove', document, 30, 30);

    expect(mouse).toEqual([]);
  });

  it('turns a second quick tap on the compass into dblclick', () => {
    dispatchTouch('touchstart', compass, 12, 12);
    dispatchTouch('touchend', document, 12, 12);
    dispatchTouch('touchstart', compass, 14, 13);
    dispatchTouch('touchend', document, 14, 13);

    expect(mouse.map((event) => event.type)).toEqual([
      'mousedown',
      'mouseup',
      'mousedown',
      'mouseup',
      'dblclick',
    ]);
  });

  it('does not start a compass gesture when the compass is blocked', () => {
    compass.classList.add('compass-blocked');
    dispatchTouch('touchstart', compass, 10, 10);

    expect(mouse).toEqual([]);
  });

  it('turns a tap on a zoom button into one click', () => {
    dispatchTouch('touchstart', zoomIn, 4, 4);
    dispatchTouch('touchend', zoomIn, 5, 6);

    expect(mouse).toEqual([{ type: 'click', clientX: 5, clientY: 6 }]);
  });

  it('does not click a zoom button after a long press', () => {
    let now = 1_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    dispatchTouch('touchstart', zoomIn, 4, 4);
    now = 1_500;
    dispatchTouch('touchend', zoomIn, 5, 6);
    vi.restoreAllMocks();

    expect(mouse.some((event) => event.type === 'click')).toBe(false);
  });

  it('does not click a zoom button after the finger slides away', () => {
    dispatchTouch('touchstart', zoomIn, 4, 4);
    dispatchTouch('touchmove', document, 40, 4);
    dispatchTouch('touchend', document, 40, 4);

    expect(mouse.some((event) => event.type === 'click')).toBe(false);
  });

  it('removes listeners when detached', () => {
    detach();
    dispatchTouch('touchstart', compass, 10, 10);
    dispatchTouch('touchstart', zoomIn, 4, 4);
    dispatchTouch('touchend', zoomIn, 4, 4);

    expect(mouse).toEqual([]);
  });
});

function mountMixinDom(): void {
  const container = document.createElement('div');
  container.className = 'cesium-widget-cesiumNavigationContainer';
  const nav = document.createElement('div');
  nav.id = 'navigationDiv';
  const compass = document.createElement('div');
  compass.className = 'compass';
  for (const name of [
    'compass-outer-ring-background',
    'compass-outer-ring',
    'compass-gyro-background',
    'compass-gyro',
  ]) {
    const el = document.createElement('div');
    el.className = name;
    compass.append(el);
  }
  const controls = document.createElement('div');
  controls.className = 'navigation-controls';
  for (const name of ['navigation-control', 'navigation-control', 'navigation-control-last']) {
    const el = document.createElement('div');
    el.className = name;
    controls.append(el);
  }
  nav.append(compass, controls);
  container.append(nav);
  document.body.append(container);
}

describe('ZnemzNavigationMixin on a mobile UA', () => {
  afterEach(() => {
    document.querySelectorAll('.cesium-widget-cesiumNavigationContainer').forEach((node) => {
      node.remove();
    });
  });

  it('mounts the compass once the viewer has loaded', async () => {
    let extended = false;
    const base = fakeViewerService();
    const viewerService = {
      ...base,
      startCamDestination: Cesium.Cartesian3.fromDegrees(37.6, 55.7, 1_500_000),
      viewerHasLoaded: signal(true),
      viewer: {
        ...base.viewer,
        extend: () => {
          extended = true;
          mountMixinDom();
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [ZnemzNavigationMixin],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ViewerService, useValue: viewerService },
        {
          provide: CheckMobileDeviceService,
          useValue: { isMobile: true, checkMobile: () => true },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ZnemzNavigationMixin);
    document.body.append(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(extended).toBe(true);
    expect(fixture.nativeElement.querySelector('.compass')).toBeTruthy();
    const ring = fixture.nativeElement.querySelector('.compass-outer-ring-background');
    expect(ring?.getAttribute('title')).toBeNull();
    expect(ring?.getAttribute('aria-describedby')).toBeTruthy();
    fixture.nativeElement.remove();
  });
});
