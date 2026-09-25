import { reportError } from '@global/lib/report-error.lib';
import { computed, Injectable, linkedSignal, signal, WritableSignal } from '@angular/core';
import * as Cesium from 'cesium';
import { Subject } from 'rxjs';

import type { DrawingToolName } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import type { MeasuringToolName } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import type { CameraToolName } from '@/components/tools/camera-view-tools/services/camera-view-tools-service/camera-view-tools.service';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import type { CustomViewer } from '@/common/services/viewer-service/viewer.service';
import { CoordSystems } from '@/common/lib/coord-systems.lib';
import type { CRS } from '@/common/lib/coord-systems.lib';
import { CursorCoordsService } from '@/common/services/cursor-coords-service/cursor-coords.service';
import { CheckMobileDeviceService } from '@global/services/check-mobile-device-service/check-mobile-device.service';

// ------------------------------------------------------------- Блок замечаний --------------------------------------------------- //

// ----------------------------------------------------------- Блок для типизации ------------------------------------------------- //

export interface ToolOptions {
  toolName?: DrawingToolName | MeasuringToolName | CameraToolName;
  groupId?: string; // globaly important!
  id?: string;
  name?: string;
  reuse?: boolean;
  clampToGround?: boolean;
  mostDetailed?: boolean;
  distanceSegmentLengthM?: number;
  show?: boolean;
  destroy?: boolean;
  callback?: () => void;
  description?: string;
  withBillboard?: boolean;
  billboard?: Cesium.BillboardGraphics | Cesium.BillboardGraphics.ConstructorOptions | undefined;
  point?: Cesium.PointGraphics | Cesium.PointGraphics.ConstructorOptions | undefined;
  withPoint?: boolean;
  label?: Cesium.LabelGraphics | Cesium.LabelGraphics.ConstructorOptions | undefined;
  polyline?: Cesium.PolylineGraphics | Cesium.PolylineGraphics.ConstructorOptions | undefined;
  polygon?: Cesium.PolygonGraphics | Cesium.PolygonGraphics.ConstructorOptions | undefined;
  withoutPolygon?: boolean;
  ellipse?: Cesium.EllipseGraphics | Cesium.EllipseGraphics.ConstructorOptions | undefined;
  ellipsoid?: Cesium.EllipsoidGraphics | Cesium.EllipsoidGraphics.ConstructorOptions | undefined;
  withCoordsDesc?: boolean;
  color?: Cesium.Color;
  randomColor?: boolean;
  auxiliaryColor?: Cesium.Color;
  isMeasures?: boolean;
  material?:
    | Cesium.MaterialProperty
    | Cesium.ColorMaterialProperty
    | Cesium.PolylineDashMaterialProperty
    | Cesium.PolylineArrowMaterialProperty;
  width?: number;
  horizontal?: boolean;
  arrow?: boolean;
  pixelSize?: number;
  font?: string;
  maximumCone?: number;
  minimumCone?: number;
  database?: string;
  properties?: { systemCoords?: string; lineColor?: Cesium.Color; [key: string]: unknown };
  hideLabel?: boolean;
  hideAuxiliary?: boolean;
}

export interface EntitiesGroup {
  groupId: string;
  entitiesList: Array<Cesium.Entity | undefined>;
  defaultEntity?: Cesium.Entity | undefined;
}

export const dataSourcesNames = Object.freeze([
  'drawLayer',
  'drawRoute',
  'measureLayer',
  'cameraViewToolsLayer',
  'analysisToolsLayer',
] as const);
export type DataSourceName = (typeof dataSourcesNames)[number];

export type ActiveToolName =
  | DrawingToolName
  | MeasuringToolName
  | CameraToolName
  | 'entityRubber'
  | 'flyAroundWithoutPoint';

export type PositionCoordsDescription = {
  latitudeDescription: string;
  longitudeDescription: string;
  heightDescription: string;
  coordsDescription: string;
};

export type PositionCoordsNumbers = {
  latitude: string;
  longitude: string;
  height: string;
  crs: string;
};

// ---------------------------------------------------------- Блок базовых установок ---------------------------------------------- //
// Запровайден в planet.ts
@Injectable()
// Сервис стартует вместе с viewer'ом и координатами под курсором в директиве run-viewer.directive.ts
export class ToolsService {
  constructor(
    private $viewerService: ViewerService,
    private $cursorCoordsService: CursorCoordsService,
    private $checkMobileDeviceService: CheckMobileDeviceService,
  ) {
    this._isMobile = this.$checkMobileDeviceService.checkMobile();
  }

  //------------------------------------------------------------ //

  // Старт сервиса
  // Обход типов здесь применен для предотвращения последующих принуждений к проверкам на undefined
  private _viewer: CustomViewer = {} as CustomViewer;
  get viewer() {
    return this._viewer;
  }
  private _toolsServiceHasStarted = signal<boolean>(false);
  // Еще используется в planet.html
  get toolsServiceHasStarted() {
    return this._toolsServiceHasStarted;
  }

  private _isMobile: boolean = false;
  get isMobile() {
    return this._isMobile;
  }

  // Еще используются в верхних сервисах инструментов
  public readonly drawingToolsLayerName: DataSourceName = 'drawLayer';
  public readonly drawRouteLayerName: DataSourceName = 'drawRoute';
  public readonly measuringToolsLayerName: DataSourceName = 'measureLayer';
  public readonly cameraViewToolsLayerName: DataSourceName = 'cameraViewToolsLayer';
  public readonly analysisToolsLayerName: DataSourceName = 'analysisToolsLayer';

  // Используется в run-viewer.directive.ts
  public async startToolsService(): Promise<void> {
    try {
      // Ссылка, позволяющая локально изменять главный объект viewer из ViewerService
      this._viewer = this.$viewerService.viewer;
      await this._viewer?.dataSources.add(new Cesium.CustomDataSource(this.drawingToolsLayerName));
      await this._viewer?.dataSources.add(new Cesium.GeoJsonDataSource(this.drawRouteLayerName));
      await this._viewer?.dataSources.add(
        new Cesium.CustomDataSource(this.measuringToolsLayerName),
      );
      await this._viewer?.dataSources.add(new Cesium.CustomDataSource(this.cameraViewToolsLayerName));
      await this._viewer?.dataSources.add(new Cesium.CustomDataSource(this.analysisToolsLayerName));
      this._toolsServiceHasStarted.set(true);
    } catch (error: unknown) {
      if (this._toolsServiceHasStarted() === true) this._toolsServiceHasStarted.set(false);
      console.info('Ошибка старта ToolsService');
      throw error;
    }
  }

  //------------------------------------------------------------ //

  // Флаги для отслеживания активных инструментов посредством this._commonHandler
  private _activeTool = signal<ActiveToolName | undefined>(undefined);
  get activeTool() {
    return this._activeTool;
  }
  // Флаг "activeTool" также можно применять в инструментах, не использующих this._commonHandler
  public setActiveTool(name: ActiveToolName) {
    this._activeTool.set(name);
  }
  private _lastActiveTool = linkedSignal<ActiveToolName | undefined, ActiveToolName | undefined>({
    source: this._activeTool,
    computation(newVal, prevVal) {
      return newVal !== undefined ? newVal : prevVal?.value;
    },
  });
  get lastActiveTool() {
    return this._lastActiveTool;
  }

  //------------------------------------------------------------ //

  // Блокировка (на уровне сервисов и представлений инструментов) новых расчетов до окончания предыдущих
  private _drawingsBlocker = signal<boolean>(false);
  // Еще используется в сервисах инструментов
  get drawingsBlocker() {
    return this._drawingsBlocker;
  }
  public setDrawingsBlocker(newVal: boolean): void {
    if (typeof newVal === 'boolean') this._drawingsBlocker.set(newVal);
  }

  //------------------------------------------------------------ //

  // Управление состоянием наличия выполнения сценария работы инструментов. Детали реализации выполнения - в соответствующих сервисах инструментов.
  // Всегда должно хранить коллбэки только от одного инструмента и только во время его работы
  public _commonHandler = signal<Cesium.ScreenSpaceEventHandler | undefined>(undefined);
  get commonHandler() {
    return this._commonHandler;
  }

  public createNewCommonHandler(initializer: ActiveToolName): boolean {
    this._commonHandler.set(new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas));
    const handler = this._commonHandler();
    if (handler) handler._initializer = initializer;
    this._activeTool.set(initializer);
    return true;
  }

  public setCommonHandler(
    callbackFn:
      | Cesium.ScreenSpaceEventHandler.PositionedEventCallback
      | Cesium.ScreenSpaceEventHandler.MotionEventCallback
      | Cesium.ScreenSpaceEventHandler.WheelEventCallback
      | Cesium.ScreenSpaceEventHandler.TwoPointEventCallback
      | Cesium.ScreenSpaceEventHandler.TwoPointMotionEventCallback,
    eventType: Cesium.ScreenSpaceEventType,
    modifier?: Cesium.KeyboardEventModifier,
  ): boolean {
    this._commonHandler()?.setInputAction(callbackFn, eventType, modifier);
    return true;
  }

  public removeActionFromCommonHandler(
    eventType: Cesium.ScreenSpaceEventType,
    modifier?: Cesium.KeyboardEventModifier,
  ): boolean {
    this._commonHandler()?.removeInputAction(eventType, modifier);
    return true;
  }

  public clearCommonHandler(): boolean {
    try {
      this._activeTool.set(undefined);
      if (this._commonHandler() !== undefined) {
        if (this._commonHandler() instanceof Cesium.ScreenSpaceEventHandler) {
          this._commonHandler()?.destroy();
          if (this._commonHandler()?.isDestroyed()) {
            this._commonHandler.set(undefined);
            return true;
          } else {
            throw new Error('Error with cleaning drawing _commonHandler');
          }
        } else {
          this._commonHandler.set(undefined);
          return true;
        }
      } else return true;
    } finally {
      if (this.$viewerService.entityPickingBlock()) this.$viewerService.offEntityPickingBlock();
      if (this._drawingsBlocker() === true) this._drawingsBlocker.set(false);
    }
  }
  //------------------------------------------------------------ //
  // Событие для отлова ошибок в удаленном контексте - не имеющем обработчиков ошибок, характерных для конкретных инструментов (например в методах создания примитивов данного сервиса)

  private eventSource = new Subject<ActiveToolName | undefined>();
  public cancelEvent$ = this.eventSource.asObservable();
  private triggerForCancelEvent(data: ActiveToolName | undefined) {
    this.eventSource.next(data);
  }
  public alertAboutToolError(toolName: ActiveToolName | undefined): void {
    this.triggerForCancelEvent(toolName);
    // cancelTool-функция применяется через сам инструмент (в месте, откуда исходит такая ошибка)
    alert('Отмена сценария по причине расчетной ошибки');
  }

  //------------------------------------------------------------ //
  // Информация о рельефе

  private _nowTerrainName = computed<string | undefined>(() => {
    try {
      const currentTerrain = { id: -1, name: '' };
      const providerName: string | undefined =
        this.$viewerService?.viewer?.terrainProvider?.credit?.html;
      if (providerName) {
        return providerName;
      } else {
        return currentTerrain?.id !== -1 ? currentTerrain?.name : undefined; // не приоритетно (хардкод в сигнале sigCurrentTerrainLayer)
      }
    } catch (error: unknown) {
      reportError(error);
      return undefined;
    }
  });
  get nowTerrainName() {
    return this._nowTerrainName;
  }

  private _isTerrain = computed<boolean>(() => {
    try {
      if (!!this._nowTerrainName()) {
        return true;
      } else return false;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  });
  get isTerrain() {
    return this._isTerrain;
  }

  // ---------------------------------------------------- Блок создания примитивов ------------------------------------------------ //

  public setPointEntity(
    position: Cesium.Cartesian3,
    options: ToolOptions = {},
  ): Cesium.Entity | undefined {
    try {
      if (position === undefined) throw new Error('Position arg is undefined in setPointEntity()');
      const id: string = options?.id ? options?.id : `${Math.ceil(Math.random() * 1000000)}`;
      if (this._viewer.entities?.getById(id)) {
        throw new Error('Entity already exists on draw layer in setPointEntity()');
      }
      const pointEntity = new Cesium.Entity({
        id: id,
        name: options?.name ? options?.name : options?.id ? `${id}` : `${'point'}-${id}`,
        position: position,
        billboard: options?.billboard || undefined,
        label: !options?.label
          ? undefined
          : {
              ...{
                show: true,
                text: options?.name ? options?.name : options?.id ? `${id}` : `${'point'}-${id}`,
                showBackground: true,
                backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.4),
                font: '14px sans-serif', // как в .kml
                translucencyByDistance: new Cesium.NearFarScalar(3000000, 1, 5000000, 0), // как в .kml
                style: Cesium.LabelStyle.FILL, // .value === 0
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // .value === 1 - как в .kml
                verticalOrigin: Cesium.VerticalOrigin.TOP,
                pixelOffset: new Cesium.Cartesian2(0, -60),
                // disableDepthTestDistance: Number.POSITIVE_INFINITY, // будет просвечивать сквозь рельеф
                disableDepthTestDistance: undefined, // будет перекрываться рельефом
                // heightReference конфликтует с 2d и 2.5d режимами использования карты (контролируется извне)
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                // ------- //
                // style: Cesium.LabelStyle.FILL_AND_OUTLINE, // .value === 2 - как в .kml
                // eyeOffset: new Cesium.Cartesian3(0.0, 0.0, -1.0),
                // pixelOffset: new Cesium.Cartesian2(-65, -70), // left top
                // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(2414016, 1, 16093000, 0.1), // как в .kml,
              },
              ...options?.label,
            },
        // Наличие точки (даже невидимой) необходимо по требованию kml-стандарта
        point: {
          ...{
            show: false,
            // pixelSize: 1,
            // color: Cesium.Color.TRANSPARENT.withAlpha(1),
            pixelSize: 4,
            color: Cesium.Color.WHITE,
            outline: false,
            disableDepthTestDistance: undefined, // будет перекрываться рельефом (при clampToGround)
            // disableDepthTestDistance: Number.POSITIVE_INFINITY,
            heightReference: options?.clampToGround
              ? Cesium.HeightReference.CLAMP_TO_GROUND
              : Cesium.HeightReference.NONE,
          },
          ...options?.point,
        },
        // description: НЕ ВЫСТАВЛЯТЬ - ИСПОЛЬЗУЕТСЯ ЭКСПОРТОМ .KML
        properties: options?.properties || undefined,
        show: options?.show !== undefined ? options.show : true,
      });
      if (options?.clampToGround === undefined) {
        const clampToGround: boolean = this.$viewerService?.clampToGroundSignal?.();
        if (pointEntity?.label && options?.clampToGround === undefined) {
          pointEntity.label.heightReference = clampToGround
            ? new Cesium.ConstantProperty(Cesium.HeightReference.CLAMP_TO_GROUND)
            : new Cesium.ConstantProperty(Cesium.HeightReference.NONE);
        }
        if (pointEntity?.billboard && options?.clampToGround === undefined) {
          pointEntity.billboard.heightReference = clampToGround
            ? new Cesium.ConstantProperty(Cesium.HeightReference.CLAMP_TO_GROUND)
            : new Cesium.ConstantProperty(Cesium.HeightReference.NONE);
        }
        if (clampToGround === true) {
          this.setClampingToGroundForEntity(pointEntity);
        }
      }
      if (options?.clampToGround === true) {
        // Проверка на разрешение прикрепления сущности к земле (разрешено только для this.$viewerService.viewer.scene.mode === 3 - "3D")
        this.setClampingToGroundForEntity(pointEntity);
      }
      if (options.toolName) pointEntity.toolName = options.toolName;
      return pointEntity;
    } catch (error: unknown) {
      this.alertAboutToolError(this._lastActiveTool());
      reportError(error);
      return undefined;
    }
  }

  public setLineEntity(
    polylinePositions: Array<Cesium.Cartesian3>,
    labelPosition?: Cesium.Cartesian3,
    labelText?: string,
    options: ToolOptions = {},
  ): Cesium.Entity | undefined {
    try {
      if (!polylinePositions?.length)
        throw new Error('Positions arg is undefined in setLineEntity()');
      const id: string = options?.id ? options?.id : `${Math.ceil(Math.random() * 1000000)}`;
      if (this._viewer.entities?.getById(id)) {
        throw new Error('Entity already exists on draw layer in setLineEntity()');
      }
      if (options?.clampToGround === undefined)
        options.clampToGround = this.$viewerService?.clampToGroundSignal?.();
      const lineEntity = new Cesium.Entity({
        id: id,
        name: options?.name ? options?.name : options?.id ? `${id}` : `${'line'}-${id}`,
        position: labelPosition,
        label: {
          ...{
            // text: new Cesium.CallbackProperty(() => labelText, false), // задавать непосредственно при построении
            text: labelText
              ? labelText
              : options?.name
                ? options.name
                : options?.id
                  ? `${id}`
                  : `${'line'}-${id}`,
            show: true,
            showBackground: true,
            font: options?.font ? options?.font : '14px monospace',
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(-20, -20),
            translucencyByDistance: new Cesium.NearFarScalar(3000000, 1, 5000000, 0), // как в .kml
            style: Cesium.LabelStyle.FILL, // .value === 0
            disableDepthTestDistance: undefined,
            // disableDepthTestDistance: Number.POSITIVE_INFINITY,
            heightReference: options?.clampToGround
              ? Cesium.HeightReference.CLAMP_TO_GROUND
              : Cesium.HeightReference.NONE,
          },
          ...options?.label,
        },
        polyline: {
          ...{
            positions: polylinePositions,
            width: options?.width ? options?.width : 3,
            material:
              options?.isMeasures === true
                ? new Cesium.PolylineDashMaterialProperty({
                    color: options?.color ? options?.color : Cesium.Color.RED.withAlpha(1), // withAlpha < 1 конфликтует с css hex color html инпута
                    gapColor: Cesium.Color.TRANSPARENT,
                    dashLength: 16.0,
                    dashPattern: 3855, // 255 || 3855 || 21845
                  })
                : options?.material
                  ? options.material
                  : options?.color
                    ? options?.color
                    : options?.randomColor
                      ? Cesium.Color.fromHsl(Math.random(), 1.0, 0.5, 1.0) // в модели HSL чистому яркому цвету соответствует Lightness = 0.5
                      : // : Cesium.Color.fromRandom({
                        //     minimumRed: 0.5,
                        //     minimumGreen: 0.5,
                        //     minimumBlue: 0.5,
                        //     alpha: 1.0,
                        //   }),
                        Cesium.Color.CHOCOLATE.withAlpha(1), // withAlpha < 1 конфликтует с css hex color html инпута
            // depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
            //   color: Cesium.Color.GRAY.withAlpha(1),
            // }),
            clampToGround: options?.clampToGround,
          },
          ...options?.polyline,
        },
        properties: options?.properties || undefined,
      });
      // console.log('lineEntity :>> ', lineEntity);
      if (options?.clampToGround === true) {
        // Проверка на разрешение прикрепления сущности к земле (разрешено только для this.$viewerService.viewer.scene.mode === 3 - "3D")
        this.setClampingToGroundForEntity(lineEntity);
      }
      if (options.toolName) lineEntity.toolName = options.toolName;
      return lineEntity;
    } catch (error: unknown) {
      this.alertAboutToolError(this._lastActiveTool());
      reportError(error);
      return undefined;
    }
  }

  public setPolygonEntity(
    polylinePositions: Array<Cesium.Cartesian3>,
    labelPosition: Cesium.Cartesian3,
    labelText: string,
    polygonHierarchy: Cesium.PolygonHierarchy,
    options: ToolOptions = {},
  ): Cesium.Entity | undefined {
    try {
      if (!polylinePositions?.length)
        throw new Error('Positions arg is undefined in setLineEntity()');
      const id: string = options?.id ? options?.id : `${Math.ceil(Math.random() * 1000000)}`;
      if (this._viewer.entities?.getById(id)) {
        throw new Error('Entity already exists on draw layer in setPolygonEntity()');
      }
      if (options?.clampToGround === undefined)
        options.clampToGround = this.$viewerService?.clampToGroundSignal?.();
      const polygonEntity = new Cesium.Entity({
        id: id,
        name: options?.name ? options?.name : options?.id ? `${id}` : `${'polygon'}-${id}`,
        position: labelPosition,
        point: {
          ...{
            show: false,
            // pixelSize: 1,
            // color: Cesium.Color.TRANSPARENT.withAlpha(1),
            pixelSize: 4,
            color: Cesium.Color.WHITE,
            outline: false,
            disableDepthTestDistance: undefined, // будет перекрываться рельефом (при clampToGround)
            // disableDepthTestDistance: Number.POSITIVE_INFINITY,
            heightReference: options?.clampToGround
              ? Cesium.HeightReference.CLAMP_TO_GROUND
              : Cesium.HeightReference.NONE,
          },
          ...options?.point,
        },
        label: {
          ...{
            text: labelText
              ? labelText
              : options?.name
                ? options.name
                : options?.id
                  ? `${id}`
                  : `${'polygon'}-${id}`,
            show: true,
            showBackground: true,
            font: options?.font ? options?.font : '14px sans-serif',
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(-20, -40),
            translucencyByDistance: new Cesium.NearFarScalar(3000000, 1, 5000000, 0), // как в .kml
            style: Cesium.LabelStyle.FILL, // .value === 0
            disableDepthTestDistance: undefined, // будет перекрываться рельефом (при clampToGround)
            // disableDepthTestDistance: Number.POSITIVE_INFINITY, // будет просвечивать сквозь рельеф
            heightReference: options?.clampToGround
              ? Cesium.HeightReference.CLAMP_TO_GROUND
              : Cesium.HeightReference.NONE,
          },
          ...options?.label,
        },
        polyline: {
          ...{
            positions: polylinePositions,
            width: options?.width ? options?.width : 3,
            material:
              options?.isMeasures === true
                ? new Cesium.PolylineDashMaterialProperty({
                    color: options?.color ? options?.color : Cesium.Color.RED.withAlpha(1), // withAlpha < 1 конфликтует с css hex color html инпута
                    gapColor: Cesium.Color.TRANSPARENT,
                    dashLength: 16.0,
                    dashPattern: 3855, // 255 || 3855 || 21845
                  })
                : options?.color
                  ? options?.color
                  : options?.randomColor
                    ? Cesium.Color.fromHsl(Math.random(), 1.0, 0.5, 1.0) // в модели HSL чистому яркому цвету соответствует Lightness = 0.5
                    : // : Cesium.Color.fromRandom({
                      //     minimumRed: 0.5,
                      //     minimumGreen: 0.5,
                      //     minimumBlue: 0.5,
                      //     alpha: 1.0,
                      //   }),
                      Cesium.Color.CHOCOLATE.withAlpha(1), // withAlpha < 1 конфликтует с css hex color html инпута
            clampToGround: options?.clampToGround,
          },
          ...options?.polyline,
        },
        polygon: options?.withoutPolygon
          ? undefined
          : {
              material: options?.material ? options?.material : Cesium.Color.WHITE.withAlpha(0.3),
              perPositionHeight: !options.clampToGround,
              hierarchy: new Cesium.CallbackProperty(() => polygonHierarchy, false),
            },
      });
      if (options?.clampToGround === true) {
        // Проверка на разрешение прикрепления сущности к земле (разрешено только для this.$viewerService.viewer.scene.mode === 3 - "3D")
        this.setClampingToGroundForEntity(polygonEntity);
      }
      if (options.toolName) polygonEntity.toolName = options.toolName;
      return polygonEntity;
    } catch (error: unknown) {
      this.alertAboutToolError(this._lastActiveTool());
      reportError(error);
      return undefined;
    }
  }

  public setEllipseEntity(
    polylinePositions: Array<Cesium.Cartesian3>,
    labelPosition: Cesium.Cartesian3,
    labelText: string,
    semiMajorAxis: Cesium.Property | number,
    semiMinorAxis: Cesium.Property | number,
    height: Cesium.Property | number,
    options: ToolOptions = {},
  ): Cesium.Entity | undefined {
    try {
      if (!polylinePositions?.length)
        throw new Error('Positions arg is undefined in setEllipseEntity()');
      const id: string = options?.id ? options?.id : `${Math.ceil(Math.random() * 1000000)}`;
      if (this._viewer.entities?.getById(id)) {
        throw new Error('Entity already exists on draw layer in setEllipseEntity()');
      }
      if (options?.clampToGround === undefined)
        options.clampToGround = this.$viewerService?.clampToGroundSignal?.();
      const ellipseEntity = new Cesium.Entity({
        id: id,
        name: options?.name ? options?.name : options?.id ? `${id}` : `${'ellipse'}-${id}`,
        position: labelPosition,
        point: {
          ...{
            show: false,
            // pixelSize: 1,
            // color: Cesium.Color.TRANSPARENT.withAlpha(1),
            pixelSize: 4,
            color: Cesium.Color.WHITE,
            outline: false,
            disableDepthTestDistance: undefined, // будет перекрываться рельефом (при clampToGround)
            // disableDepthTestDistance: Number.POSITIVE_INFINITY,
            heightReference: options?.clampToGround
              ? Cesium.HeightReference.CLAMP_TO_GROUND
              : Cesium.HeightReference.NONE,
          },
          ...options?.point,
        },
        label: {
          ...{
            text: labelText
              ? labelText
              : options?.name
                ? options.name
                : options?.id
                  ? `${id}`
                  : `${'ellipse'}-${id}`,
            show: true,
            showBackground: true,
            font: options?.font ? options?.font : '14px sans-serif',
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(-20, -40),
            translucencyByDistance: new Cesium.NearFarScalar(3000000, 1, 5000000, 0), // как в .kml
            style: Cesium.LabelStyle.FILL, // .value === 0
            disableDepthTestDistance: undefined, // будет перекрываться рельефом (при clampToGround)
            // disableDepthTestDistance: Number.POSITIVE_INFINITY, // будет просвечивать сквозь рельеф
            heightReference: options?.clampToGround
              ? Cesium.HeightReference.CLAMP_TO_GROUND
              : Cesium.HeightReference.NONE,
          },
          ...options?.label,
        },
        polyline: {
          ...{
            positions: polylinePositions,
            width: options?.width ? options?.width : 3,
            material:
              options?.isMeasures === true
                ? new Cesium.PolylineDashMaterialProperty({
                    color: options?.color ? options?.color : Cesium.Color.RED.withAlpha(1), // withAlpha < 1 конфликтует с css hex color html инпута
                    gapColor: Cesium.Color.TRANSPARENT,
                    dashLength: 16.0,
                    dashPattern: 3855, // 255 || 3855 || 21845
                  })
                : options?.color
                  ? options?.color
                  : options?.randomColor
                    ? Cesium.Color.fromHsl(Math.random(), 1.0, 0.5, 1.0) // в модели HSL чистому яркому цвету соответствует Lightness = 0.5
                    : // : Cesium.Color.fromRandom({
                      //     minimumRed: 0.5,
                      //     minimumGreen: 0.5,
                      //     minimumBlue: 0.5,
                      //     alpha: 1.0,
                      //   }),
                      Cesium.Color.CHOCOLATE.withAlpha(1), // withAlpha < 1 конфликтует с css hex color html инпута
            clampToGround: options?.clampToGround,
          },
          ...options?.polyline,
        },
        polygon: options?.withoutPolygon
          ? undefined
          : options?.polygon
            ? options.polygon
            : undefined,
        ellipse: {
          ...{
            semiMinorAxis: semiMinorAxis || 0.0,
            semiMajorAxis: semiMajorAxis || 0.0,
            rotation: 0,
            material: Cesium.Color.WHITE.withAlpha(0.3),
            // Конфликтует в привязкой к рельефу
            // outline: false,
            // outlineColor: options?.color ? options?.color : Cesium.Color.CHOCOLATE.withAlpha(1),
            // outlineWidth: options?.width ? options?.width : 3,
            height: height || 0.0,
            heightReference: options?.clampToGround
              ? Cesium.HeightReference.CLAMP_TO_GROUND
              : Cesium.HeightReference.NONE,
            show: true,
          },
          ...options?.ellipse,
        },
      });
      if (options?.clampToGround === true) {
        // Проверка на разрешение прикрепления сущности к земле (разрешено только для this.$viewerService.viewer.scene.mode === 3 - "3D")
        this.setClampingToGroundForEntity(ellipseEntity);
      }
      if (options.toolName) ellipseEntity.toolName = options.toolName;
      return ellipseEntity;
    } catch (error: unknown) {
      this.alertAboutToolError(this._lastActiveTool());
      reportError(error);
      return undefined;
    }
  }

  public setEllipsoidEntity(
    polylinePositions: Array<Cesium.Cartesian3>,
    labelPosition: Cesium.Cartesian3,
    labelText: string,
    radii: Cesium.Cartesian3,
    ellipseRadius: number,
    ellipseHeight: number,
    options: ToolOptions = {},
  ): Cesium.Entity | undefined {
    try {
      if (!polylinePositions?.length)
        throw new Error('Positions arg is undefined in setEllipsoidEntity()');
      const id: string = options?.id ? options?.id : `${Math.ceil(Math.random() * 1000000)}`;
      if (this._viewer.entities?.getById(id)) {
        throw new Error('Entity already exists on draw layer in setEllipsoidEntity()');
      }
      const ellipsoidMaterial = options?.color
        ? options?.color
        : options?.randomColor
          ? Cesium.Color.fromHsl(Math.random(), 1.0, 0.5, 1.0) // в модели HSL чистому яркому цвету соответствует Lightness = 0.5
          : // : Cesium.Color.fromRandom({
            //     minimumRed: 0.5,
            //     minimumGreen: 0.5,
            //     minimumBlue: 0.5,
            //     alpha: 1.0,
            //   }),
            Cesium.Color.BLUE.withAlpha(0.3);
      // При своем последующем изменении багует (крашит приложение), если ранее происходило изменение ellipsoid.maximumCone
      // let ellipsoidOutlineColor = options.color ? options.color : Cesium.Color.BLUE.withAlpha(1);
      // if (options?.color) {
      //   ellipsoidOutlineColor.alpha = 1;
      // }
      const ellipsoidOutlineColor = Cesium.Color.BLACK.withAlpha(1);
      let polylineMaterial;
      if (options?.arrow) {
        polylineMaterial = new Cesium.PolylineArrowMaterialProperty(
          options?.auxiliaryColor ? options?.auxiliaryColor : Cesium.Color.RED.withAlpha(1),
        );
      } else {
        polylineMaterial = new Cesium.PolylineDashMaterialProperty({
          color: options?.auxiliaryColor ? options?.auxiliaryColor : Cesium.Color.RED.withAlpha(1),
          gapColor: Cesium.Color.TRANSPARENT,
          dashLength: 16.0,
          dashPattern: 3855, // 255 || 3855 || 21845
        });
      }
      const ellipseOutlineColor = options?.auxiliaryColor
        ? options?.auxiliaryColor
        : Cesium.Color.RED.withAlpha(1);
      // Notice: ellipsoid.heightReference: Cesium.HeightReference.CLAMP_TO_GROUND даст негативный результат, прикрепление к земле контролируется исключительно высотой entity.position
      const ellipsoidEntity = new Cesium.Entity({
        id: id,
        name: options?.name ? options?.name : options?.id ? `${id}` : `${'ellipsoid'}-${id}`,
        position: labelPosition,
        point: options.withPoint
          ? {
              ...{
                pixelSize: 4,
                color: Cesium.Color.WHITE.withAlpha(1),
                outline: true,
                outlineColor: options.auxiliaryColor
                  ? options?.auxiliaryColor
                  : Cesium.Color.RED.withAlpha(1),
                outlineWidth: 2,
                // disableDepthTestDistance: undefined, // будет перекрываться рельефом (при clampToGround)
                disableDepthTestDistance: Number.POSITIVE_INFINITY, // будет просвечивать сквозь рельеф
                // Не выставлять! Контролировать высоту entity.position
                // heightReference: options?.clampToGround
                //   ? Cesium.HeightReference.CLAMP_TO_GROUND
                //   : Cesium.HeightReference.NONE,
                heightReference: Cesium.HeightReference.NONE,
              },
              ...options?.point,
            }
          : undefined,
        label: {
          ...{
            text: labelText
              ? labelText
              : options?.name
                ? options.name
                : options?.id
                  ? `${id}`
                  : `${'ellipsoid'}-${id}`,
            show: true,
            showBackground: true,
            font: options?.font ? options?.font : '14px monospace',
            // font: options?.font ? options?.font : '20px sans-serif',
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            // pixelOffset: new Cesium.Cartesian2(-20, -40),
            pixelOffset: new Cesium.Cartesian2(20, 0),
            translucencyByDistance: new Cesium.NearFarScalar(3000000, 1, 5000000, 0), // как в .kml
            style: Cesium.LabelStyle.FILL, // .value === 0
            // disableDepthTestDistance: undefined, // будет перекрываться рельефом (при clampToGround)
            disableDepthTestDistance: Number.POSITIVE_INFINITY, // будет просвечивать сквозь рельеф
            // Не выставлять! Контролировать высоту entity.position
            // heightReference: options?.clampToGround
            //   ? Cesium.HeightReference.CLAMP_TO_GROUND
            //   : Cesium.HeightReference.NONE,
            heightReference: Cesium.HeightReference.NONE,
          },
          ...options?.label,
        },
        polyline: options.withPoint
          ? {
              ...{
                positions: polylinePositions,
                width: options?.width ? options?.width : 3,
                material: polylineMaterial,
                // Не выставлять! Контролировать высоту entity.position
                // clampToGround: options?.clampToGround,
                clampToGround: false,
                show: true,
              },
              ...options?.polyline,
            }
          : undefined,
        ellipse: options.withPoint
          ? {
              ...{
                semiMinorAxis: ellipseRadius,
                semiMajorAxis: ellipseRadius,
                rotation: 0,
                material: Cesium.Color.WHITE.withAlpha(0.3),
                outline: true,
                outlineColor: ellipseOutlineColor,
                outlineWidth: options?.width ? options?.width : 3,
                height: ellipseHeight || 0.0,
                // Не выставлять! Контролировать высоту entity.position
                // heightReference: options?.clampToGround
                //   ? Cesium.HeightReference.CLAMP_TO_GROUND
                //   : Cesium.HeightReference.NONE,
                heightReference: Cesium.HeightReference.NONE,
                show: true,
              },
              ...options?.ellipse,
            }
          : undefined,
        ellipsoid: {
          ...{
            radii: radii,
            minimumCone: options?.minimumCone ? options?.minimumCone : Cesium.Math.toRadians(0),
            maximumCone: options?.maximumCone ? options?.maximumCone : Cesium.Math.toRadians(90), // Cesium.Math.PI / 2
            material: ellipsoidMaterial,
            outline: true,
            outlineColor: ellipsoidOutlineColor,
            // outlineWidth: options?.width ? options?.width : 3,
            outlineWidth: options?.width ? options?.width : 1,
            // Не выставлять! Контролировать высоту entity.position
            // heightReference: options?.clampToGround
            //   ? Cesium.HeightReference.CLAMP_TO_GROUND
            //   : Cesium.HeightReference.NONE,
            heightReference: Cesium.HeightReference.NONE,
            show: true,
          },
          ...options?.ellipsoid,
        },
      });
      // if (options?.clampToGround === true) {
      //   // Проверка на разрешение прикрепления сущности к земле (разрешено только для this.$viewerService.viewer.scene.mode === 3 - "3D")
      //   this.setClampingToGroundForEntity(ellipsoidEntity);
      // }
      if (options.toolName) ellipsoidEntity.toolName = options.toolName;
      return ellipsoidEntity;
    } catch (error: unknown) {
      this.alertAboutToolError(this._lastActiveTool());
      reportError(error);
      return undefined;
    }
  }

  // ----------------------- Блок изменения свойств сущностей (через состояния в хранилищах инструментов) ------------------------- //

  public changeEntityName(
    newName: string,
    id: string,
    store: WritableSignal<Array<EntitiesGroup | undefined>>,
    newLabelText?: string,
  ): boolean {
    try {
      const path = this.findEntityPathInStore(id, store);
      const indexGroup = path.indexGroup;
      const indexEntity = path.indexEntity;
      if (indexGroup === undefined || indexEntity === undefined)
        throw new Error("Entity's path search error in changeEntityName fn");
      const named = store()[indexGroup]?.entitiesList[indexEntity];
      if (named?.name) {
        // Срабатывание сигнала отслеживается для обновления имени в левой панели
        store.update((oldStore) => {
          const stored = oldStore[indexGroup]?.entitiesList[indexEntity];
          if (stored) stored.name = newName.trim();
          return [...oldStore];
        });
      } else throw new Error("Invalid path to entity's name in changeEntityName fn");
      const labeled = store()[indexGroup]?.entitiesList[indexEntity];
      if (newLabelText !== undefined && typeof newLabelText === 'string' && labeled?.label) {
        labeled.label.text = new Cesium.ConstantProperty(newLabelText.trim());
      }
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  //------------------------------------------------------------ //

  public changeEntityColor(
    newVal: string,
    id: string,
    store: WritableSignal<Array<EntitiesGroup | undefined>>,
  ): boolean {
    try {
      const path = this.findEntityPathInStore(id, store);
      const indexGroup = path.indexGroup;
      const indexEntity = path.indexEntity;
      if (indexGroup === undefined || indexEntity === undefined)
        throw new Error("Entity's path search error in changeEntityName fn");
      const entity = store()[indexGroup]?.entitiesList[indexEntity];
      const color = colorFromCssString(newVal);
      if (!color || !entity?.polyline?.material) return false;
      entity.polyline.material = new Cesium.ColorMaterialProperty(color);
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  //------------------------------------------------------------ //

  // Поиск актуальный только при соответствии конструкции стора типу WritableSignal<Array<EntitiesGroup | undefined>>
  public findEntityPathInStore(
    id: string,
    store: WritableSignal<Array<EntitiesGroup | undefined>>,
  ): { indexGroup: number | undefined; indexEntity: number | undefined } {
    try {
      if (id.split('-').length < 2)
        throw new Error('Invalid id (none groupId) in findEntityPathInStore fn');
      const groupId: string = id.split('-')[0];
      if (!store().length) throw new Error('Store is empty in findEntityPathInStore fn');
      const indexGroup = store().findIndex((item) => item?.groupId === groupId);
      if (indexGroup === -1) {
        // console.log(
        //   (
        //     'There is no seeking group in store in findEntityPathInStore fn. Object may be already deleted.',
        //   ),
        // );
        return { indexGroup: undefined, indexEntity: undefined };
      }
      const group = store()[indexGroup];
      if (!group?.entitiesList.length) {
        console.info(
          'Entity collection in group is empty in findEntityPathInStore fn. Array may be already cleared.',
        );
        return { indexGroup: undefined, indexEntity: undefined };
      }
      const indexEntity = group.entitiesList.findIndex((entity) => entity?.id === id);
      if (indexGroup === -1) {
        // console.log(
        //   (
        //     'There is no seeking entity in store in findEntityPathInStore fn. Object may be already deleted.',
        //   ),
        // );
        return { indexGroup: undefined, indexEntity: undefined };
      }
      return { indexGroup: indexGroup, indexEntity: indexEntity };
    } catch (error: unknown) {
      reportError(error);
      return { indexGroup: undefined, indexEntity: undefined };
    }
  }

  //------------------------------------------------------------ //

  // Переключение "прилипания" к рельефу компонентов сущностей сторов инструментов из соответствующих сервисов.
  // Данные методы используется по причине конфликта данной фичи цезиума на 2d- и 2.5d-режимах отображения карты.
  // Методы могут применяться в эффектах main-сервисов нуждающихся в таком переключении инструментов.

  // Deprecated
  // Заменено на адресное применение в this.switchClampingToGroundForOneStoreEntities()
  // public switchClampingToGroundForAllStoresEntities(
  //   stores: Array<WritableSignal<Array<EntitiesGroup | undefined>>>,
  //   isClamped: boolean,
  // ): boolean {
  //   try {
  //     if (!stores.length) return false;
  //     let counter: number = 0;
  //     for (const store of stores) {
  //       if (!store().length) continue;
  //       const isRes = this.switchClampingToGroundForOneStoreEntities(store, isClamped);
  //       if (isRes) counter++;
  //     }
  //     if (counter === stores.length) return true;
  //     else return false;
  //   } catch (error: unknown) {
  //     reportError(error);
  //     return false;
  //   }
  // }

  public switchClampingToGroundForOneStoreEntities(
    store: WritableSignal<Array<EntitiesGroup | undefined>>,
    isClamped: boolean,
  ): boolean {
    try {
      console.info(`Switching clamping to ground for entities in store: "${store.name}"`);
      if (!store().length) return false;
      let counter: number = 0;
      let counterTwo: number = 0;
      for (const group of store()) {
        if (!group?.entitiesList.length) continue;
        counterTwo = counterTwo + group.entitiesList.length;
        for (const entity of group.entitiesList) {
          if (entity instanceof Cesium.Entity) {
            const isRes = this.switchClampingToGroundForEntity(entity, isClamped);
            if (isRes) counter++;
          }
        }
      }
      if (counter === counterTwo) return true;
      else return false;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  public switchClampingToGroundForTemporalEntities(
    temporalStore: WritableSignal<Array<Cesium.Entity | undefined>>,
    isClamped: boolean,
    exceptions?: Array<string>,
  ): boolean {
    try {
      if (!temporalStore().length) return false;
      let counter: number = 0;
      let exceptionsCounter: number = 0;
      for (const entity of temporalStore()) {
        if (entity instanceof Cesium.Entity) {
          if (exceptions?.length) {
            let isException: boolean = false;
            for (const exception of exceptions) {
              if (entity?.id?.includes(exception) === true) {
                isException = true;
                exceptionsCounter++;
              }
            }
            if (!isException) {
              const isRes = this.switchClampingToGroundForEntity(entity, isClamped);
              if (isRes) counter++;
            }
          } else {
            const isRes = this.switchClampingToGroundForEntity(entity, isClamped);
            if (isRes) counter++;
          }
        }
      }
      if (counter === temporalStore().length - exceptionsCounter) return true;
      else return false;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  // Для конструкторов сущностей
  public setClampingToGroundForEntity(entity: Cesium.Entity): boolean {
    try {
      let isClamped: boolean = true;
      if (
        this.$viewerService.viewer.scene.mode === Cesium.SceneMode.COLUMBUS_VIEW ||
        this.$viewerService.viewer.scene.mode === Cesium.SceneMode.SCENE2D
      ) {
        isClamped = false;
      }
      return this.switchClampingToGroundForEntity(entity, isClamped);
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  // Для массового переключения
  public switchClampingToGroundForEntity(entity: Cesium.Entity, isClamped: boolean): boolean {
    try {
      if (entity?.point) {
        isClamped
          ? (entity.point.heightReference = new Cesium.ConstantProperty(
              Cesium.HeightReference.CLAMP_TO_GROUND,
            ))
          : (entity.point.heightReference = new Cesium.ConstantProperty(
              Cesium.HeightReference.NONE,
            ));
        isClamped
          ? (entity.point.disableDepthTestDistance = undefined)
          : (entity.point.disableDepthTestDistance = new Cesium.ConstantProperty(
              Number.POSITIVE_INFINITY,
            ));
      }
      if (entity?.label) {
        isClamped
          ? (entity.label.heightReference = new Cesium.ConstantProperty(
              Cesium.HeightReference.CLAMP_TO_GROUND,
            ))
          : (entity.label.heightReference = new Cesium.ConstantProperty(
              Cesium.HeightReference.NONE,
            ));
        isClamped
          ? (entity.label.disableDepthTestDistance = undefined)
          : (entity.label.disableDepthTestDistance = new Cesium.ConstantProperty(
              Number.POSITIVE_INFINITY,
            ));
      }
      if (entity?.billboard) {
        isClamped
          ? (entity.billboard.heightReference = new Cesium.ConstantProperty(
              Cesium.HeightReference.CLAMP_TO_GROUND,
            ))
          : (entity.billboard.heightReference = new Cesium.ConstantProperty(
              Cesium.HeightReference.NONE,
            ));
        isClamped
          ? (entity.billboard.disableDepthTestDistance = undefined)
          : (entity.billboard.disableDepthTestDistance = new Cesium.ConstantProperty(
              Number.POSITIVE_INFINITY,
            ));
      }
      if (entity?.polyline) {
        entity.polyline.clampToGround = new Cesium.ConstantProperty(isClamped);
      }
      if (entity?.polygon?.perPositionHeight) {
        entity.polygon.perPositionHeight = new Cesium.ConstantProperty(!isClamped);
      }
      if (entity?.ellipse) {
        isClamped
          ? (entity.ellipse.heightReference = new Cesium.ConstantProperty(
              Cesium.HeightReference.CLAMP_TO_GROUND,
            ))
          : (entity.ellipse.heightReference = new Cesium.ConstantProperty(
              Cesium.HeightReference.NONE,
            ));
      }
      // На текущий момент прикрепление эллипсоида к рельефу осуществляется только посредством высоты entity.position
      // Для инструментов, использующих entity.ellipsoid, данная функция не будет применена (особенность поведения Cesium.Entity.ellipsoid).
      return true;
    } catch (error: unknown) {
      reportError(error);

      return false;
    }
  }

  //------------------------------------------------------------ //

  // Общий таймер для таймаутов с this.setConstantsForStoreEntities()
  public readonly setEntityConstantsTimer: number = 180000;
  //* Все заданные при построении сущности Cesium.CallbackProperty в целях экономии ресурсов необходимо заменять на константы (вызывает перерендер - сущность "мигнет")
  public setConstantsForStoreEntities(
    store: WritableSignal<Array<EntitiesGroup | undefined>>,
    id: string | undefined,
  ): boolean {
    try {
      const entityId = id; // копия на случай смены сущности во время выполнения функции
      if (!entityId || typeof entityId !== 'string') {
        throw new Error("Invalid entity's ID in setConstantsForStoreEntities fn");
      }
      if (!store().length) return false;
      const path = this.findEntityPathInStore(entityId, store);
      if (path.indexGroup === undefined || path.indexEntity === undefined) {
        // console.info("Entity's path searching error in setConstantsForStoreEntities fn");
        return false;
      }
      const entity = store()?.[path.indexGroup]?.entitiesList?.[path.indexEntity];
      if (!entity || !(entity instanceof Cesium.Entity)) {
        throw new Error('Invalid entity in setConstantsForStoreEntities fn');
      }
      console.info('Auto rerender for:', id);
      if (isReactiveCesiumProperty(entity.position)) {
        const pos = cartesianFromProperty(entity.position.getValue());
        if (pos) {
          entity.position = new Cesium.ConstantPositionProperty(pos);
        }
      }
      if (entity.label?.text && isReactiveCesiumProperty(entity.label.text)) {
        const text = stringFromProperty(entity.label.text.getValue());
        if (text !== undefined) {
          entity.label.text = new Cesium.ConstantProperty(text);
        }
      }
      if (entity.billboard?.color && isReactiveCesiumProperty(entity.billboard.color)) {
        const color = colorFromProperty(entity.billboard.color.getValue());
        if (color) {
          entity.billboard.color = new Cesium.ConstantProperty(
            new Cesium.Color(color.red, color.green, color.blue, color.alpha ?? 1),
          );
        }
      }
      if (entity.polyline) {
        if (entity.polyline.positions && isReactiveCesiumProperty(entity.polyline.positions)) {
          const positions = cartesian3ListFromProperty(entity.polyline.positions.getValue());
          if (positions.length) {
            entity.polyline.positions = new Cesium.ConstantProperty(positions);
          }
        }
        if (entity.polyline.material && isReactiveCesiumProperty(entity.polyline.material)) {
          const color = colorFromCallbackMaterial(entity.polyline.material.getValue());
          if (color) {
            entity.polyline.material = new Cesium.ColorMaterialProperty(color);
          }
        }
      }
      if (entity.polygon?.material && isReactiveCesiumProperty(entity.polygon.material)) {
        const color = colorFromCallbackMaterial(entity.polygon.material.getValue());
        if (color) {
          entity.polygon.material = new Cesium.ColorMaterialProperty(color);
        }
      }
      if (entity.ellipse) {
        if (
          entity.ellipse.semiMinorAxis &&
          isReactiveCesiumProperty(entity.ellipse.semiMinorAxis)
        ) {
          const semiMinorAxis = numberFromProperty(entity.ellipse.semiMinorAxis.getValue());
          if (semiMinorAxis !== undefined) {
            entity.ellipse.semiMinorAxis = new Cesium.ConstantProperty(semiMinorAxis);
          }
        }
        if (
          entity.ellipse.semiMajorAxis &&
          isReactiveCesiumProperty(entity.ellipse.semiMajorAxis)
        ) {
          const semiMajorAxis = numberFromProperty(entity.ellipse.semiMajorAxis.getValue());
          if (semiMajorAxis !== undefined) {
            entity.ellipse.semiMajorAxis = new Cesium.ConstantProperty(semiMajorAxis);
          }
        }
      }
      if (entity.ellipsoid) {
        if (entity.ellipsoid.radii && isReactiveCesiumProperty(entity.ellipsoid.radii)) {
          const radii = cartesianFromProperty(entity.ellipsoid.radii.getValue());
          if (radii) {
            entity.ellipsoid.radii = new Cesium.ConstantProperty(radii);
          }
        }
        if (entity.ellipsoid.material && isReactiveCesiumProperty(entity.ellipsoid.material)) {
          const color = colorFromCallbackMaterial(entity.ellipsoid.material.getValue());
          if (color) {
            entity.ellipsoid.material = new Cesium.ColorMaterialProperty(color);
          }
        }
        if (
          entity.ellipsoid.maximumCone &&
          isReactiveCesiumProperty(entity.ellipsoid.maximumCone)
        ) {
          const maximumCone = numberFromProperty(entity.ellipsoid.maximumCone.getValue());
          if (maximumCone !== undefined) {
            entity.ellipsoid.maximumCone = new Cesium.ConstantProperty(maximumCone);
          }
        }
        if (
          entity.ellipsoid.minimumCone &&
          isReactiveCesiumProperty(entity.ellipsoid.minimumCone)
        ) {
          const minimumCone = numberFromProperty(entity.ellipsoid.minimumCone.getValue());
          if (minimumCone !== undefined) {
            entity.ellipsoid.minimumCone = new Cesium.ConstantProperty(minimumCone);
          }
        }
      }
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  // ------------------------------------------------- Блок вспомогательных функций ----------------------------------------------- //

  public async getMouseEntity(mostDetailedHeightFlag: boolean = true): Promise<Cesium.Entity> {
    return await this.$cursorCoordsService.getMouseEntity(mostDetailedHeightFlag);
  }
  public async getDetailedPosition(
    cartesian: Cesium.Cartesian3,
  ): Promise<Cesium.Cartesian3 | undefined> {
    try {
      if (cartesian === undefined || !(cartesian instanceof Cesium.Cartesian3))
        throw new Error('Invalid position data');
      const cartographictUnderClick: Cesium.Cartographic =
        Cesium.Cartographic.fromCartesian(cartesian);
      const mostDetailedHeightUnderCursor =
        await this.$viewerService.getHeight(cartographictUnderClick);
      if (
        mostDetailedHeightUnderCursor &&
        cartographictUnderClick.height !== mostDetailedHeightUnderCursor
      ) {
        const newCartographic = new Cesium.Cartographic(
          cartographictUnderClick.longitude,
          cartographictUnderClick.latitude,
          mostDetailedHeightUnderCursor,
        );
        const modifiedPosition: Cesium.Cartesian3 =
          Cesium.Cartographic.toCartesian(newCartographic);
        return modifiedPosition;
      } else {
        return cartesian;
      }
    } catch (error: unknown) {
      console.info('Detailed position calculation failed');
      reportError(error);
      return cartesian;
    }
  }

  //------------------------------------------------------------ //

  // Дубль из cursor-coords.service.ts - для автономности (используется инструментами данного сервиса)
  public async getPositionCoordsDescription(
    cartesian: Cesium.Cartesian3 | undefined,
    selectedCrs: CRS = this.$cursorCoordsService.selectedCrs(),
    heightVal?: number,
  ): Promise<PositionCoordsDescription | undefined> {
    try {
      if (cartesian === undefined)
        return {
          latitudeDescription: 'нет данных',
          longitudeDescription: 'нет данных',
          heightDescription: 'нет данных',
          coordsDescription: 'нет данных',
        };
      /* Преобразуем декартово (cartesian) представление в картографическое (cartographic) и получаем координаты */
      const cartographic =
        this.$viewerService.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);
      // Если рельеф отключен вернет 0
      // + hEgm1999; //(if heights in source dtm is geodesic);
      let height = 0;
      if (heightVal) {
        height = heightVal;
      } else {
        height = await this.$viewerService.getHeight(cartographic);
      }
      // Используем полученные данные для пересчета в текущую систему координат
      const tCrsCoord = CoordSystems.fromWGS84Cartographic(
        selectedCrs,
        {
          latitude: latitude,
          longitude: longitude,
          height: height,
        },
        '',
      );
      // Обновляем описание координат
      // Для компонента cursor-coords-info
      let latitudeDescription = '';
      let longitudeDescription = '';
      let heightDescription = '';
      // Для Cesium
      let coordsDescription: string = '';
      if (selectedCrs === 'СК-42 м') {
        latitudeDescription = `X: ${tCrsCoord.latitude.toFixed(1)} м`;
        longitudeDescription = `Y: ${tCrsCoord.longitude.toFixed(1)} м`;
        heightDescription = `H: ${tCrsCoord.height.toFixed(1)} м`;
        coordsDescription =
          `${latitudeDescription}\n` + `${longitudeDescription}\n` + `${heightDescription}`;
      } else {
        latitudeDescription = `B: ${tCrsCoord.latitude.toFixed(7)} ˚`;
        longitudeDescription = `L: ${tCrsCoord.longitude.toFixed(7)} ˚`;
        heightDescription = `H: ${tCrsCoord.height.toFixed(1)} м`;
        coordsDescription =
          `${latitudeDescription}\n` + `${longitudeDescription}\n` + `${heightDescription}`;
      }
      return {
        latitudeDescription,
        longitudeDescription,
        heightDescription,
        coordsDescription,
      };
    } catch (error: unknown) {
      reportError(error);
      return undefined;
    }
  }

  public async getPositionCoordsNumbers(
    cartesian: Cesium.Cartesian3 | undefined,
    selectedCrs: CRS = this.$cursorCoordsService.selectedCrs(),
    heightVal?: number,
  ): Promise<PositionCoordsNumbers | undefined> {
    try {
      if (cartesian === undefined) {
        return {
          latitude: 'нет данных',
          longitude: 'нет данных',
          height: 'нет данных',
          crs: 'нет данных',
        };
      }
      const cartographic =
        this.$viewerService.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);
      let height = 0;
      if (heightVal) {
        height = heightVal;
      } else {
        height = await this.$viewerService.getHeight(cartographic);
      }
      // Используем полученные данные для пересчета в текущую систему координат
      const tCrsCoord = CoordSystems.fromWGS84Cartographic(
        selectedCrs,
        {
          latitude: latitude,
          longitude: longitude,
          height: height,
        },
        '',
      );
      let latitudeCrs = '';
      let longitudeCrs = '';
      let heightCrs = '';
      if (selectedCrs === 'СК-42 м') {
        latitudeCrs = tCrsCoord.latitude.toFixed(1);
        longitudeCrs = tCrsCoord.longitude.toFixed(1);
        heightCrs = tCrsCoord.height.toFixed(1);
      } else {
        latitudeCrs = tCrsCoord.latitude.toFixed(7);
        longitudeCrs = tCrsCoord.longitude.toFixed(7);
        heightCrs = tCrsCoord.height.toFixed(1);
      }
      return {
        latitude: latitudeCrs,
        longitude: longitudeCrs,
        height: heightCrs,
        crs: selectedCrs,
      };
    } catch (error: unknown) {
      reportError(error);
      return undefined;
    }
  }

  //------------------------------------------------------------ //
}

export function cartesianFromProperty(value: unknown): Cesium.Cartesian3 | undefined {
  return value instanceof Cesium.Cartesian3 ? value : undefined;
}

export function cartesian3ListFromProperty(value: unknown): Cesium.Cartesian3[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Cesium.Cartesian3 => item instanceof Cesium.Cartesian3);
}

export function stringFromProperty(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export function booleanFromProperty(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

export function numberFromProperty(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

export function colorFromProperty(value: unknown): Cesium.Color | undefined {
  return value instanceof Cesium.Color ? value : undefined;
}

export function colorFromCssString(value: unknown): Cesium.Color | undefined {
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  return colorFromProperty(Cesium.Color.fromCssColorString(value));
}

export function colorMaterialFromProperty(
  value: unknown,
): { color?: Cesium.Color } | undefined {
  if (typeof value !== 'object' || value === null || !('color' in value)) return undefined;
  const color = colorFromProperty(value.color);
  return color ? { color } : undefined;
}

export function recordFromProperty(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;
  return Object.fromEntries(Object.entries(value));
}

export function cartesian2FromProperty(value: unknown): Cesium.Cartesian2 | undefined {
  return value instanceof Cesium.Cartesian2 ? value : undefined;
}

export function nearFarFromProperty(value: unknown): Cesium.NearFarScalar | undefined {
  return value instanceof Cesium.NearFarScalar ? value : undefined;
}

function colorFromCallbackMaterial(value: unknown): Cesium.Color | undefined {
  return colorFromProperty(value) ?? colorMaterialFromProperty(value)?.color;
}

function isReactiveCesiumProperty(
  value: unknown,
): value is Cesium.CallbackProperty | Cesium.CallbackPositionProperty {
  return (
    value instanceof Cesium.CallbackProperty || value instanceof Cesium.CallbackPositionProperty
  );
}

export function getCircle(ellipseEntity: Cesium.Entity): Array<Cesium.Cartesian3> {
  if (!ellipseEntity?.ellipse) throw new Error('Entity ellipse is undefined in getCircle()');
  const position = cartesianFromProperty(ellipseEntity.position?.getValue());
  const semiMajor = numberFromProperty(ellipseEntity.ellipse.semiMajorAxis?.getValue());
  const semiMinor = numberFromProperty(ellipseEntity.ellipse.semiMinorAxis?.getValue());
  if (!position || semiMajor === undefined || semiMinor === undefined) {
    throw new Error('Entity is not valid in getCircle()');
  }
  const rotation = numberFromProperty(ellipseEntity.ellipse.rotation?.getValue()) ?? 0;

  const geometry = new Cesium.EllipseOutlineGeometry({
    center: position,
    semiMajorAxis: semiMajor,
    semiMinorAxis: semiMinor,
    rotation,
    granularity: Math.PI / 360, // плотность точек
  });

  const ellipseGeometry = Cesium.EllipseOutlineGeometry.createGeometry(geometry);
  if (!ellipseGeometry) return [];
  const positions = [];
  if (!ellipseGeometry.attributes.position)
    throw new Error('Ellipse geometry creation failure in getCircle()');
  for (let i = 0; i < ellipseGeometry.attributes.position.values.length; i += 3) {
    positions.push(
      new Cesium.Cartesian3(
        ellipseGeometry.attributes.position.values[i],
        ellipseGeometry.attributes.position.values[i + 1],
        ellipseGeometry.attributes.position.values[i + 2],
      ),
    );
  }
  // Замыкание линии
  positions.push(positions[0]);
  return positions;
}

export function getRectangle(
  start: Cesium.Cartesian3,
  end: Cesium.Cartesian3,
): Array<Cesium.Cartesian3> {
  const startCarto = Cesium.Cartographic.fromCartesian(start);
  const endCarto = Cesium.Cartographic.fromCartesian(end);
  return [
    Cesium.Cartesian3.fromRadians(startCarto.longitude, startCarto.latitude),
    Cesium.Cartesian3.fromRadians(startCarto.longitude, endCarto.latitude),
    Cesium.Cartesian3.fromRadians(endCarto.longitude, endCarto.latitude),
    Cesium.Cartesian3.fromRadians(endCarto.longitude, startCarto.latitude),
    Cesium.Cartesian3.fromRadians(startCarto.longitude, startCarto.latitude),
  ];
}
// Deprecated
// function getCartoRect (start: Cesium.Cartesian3, end: Cesium.Cartesian3) {
//   const startPointCarto = Cesium.Cartographic.fromCartesian(start);
//   const endPointCarto = Cesium.Cartographic.fromCartesian(end);
//   const arr = [
//     startPointCarto.longitude,
//     startPointCarto.latitude,
//     0,
//     startPointCarto.longitude,
//     endPointCarto.latitude,
//     0,
//     endPointCarto.longitude,
//     endPointCarto.latitude,
//     0,
//     endPointCarto.longitude,
//     startPointCarto.latitude,
//     0,
//     startPointCarto.longitude,
//     startPointCarto.latitude,
//     0,
//   ];
//   return arr.map((rad) => Cesium.Math.toDegrees(rad)); /* rectangleGeom */
// };
