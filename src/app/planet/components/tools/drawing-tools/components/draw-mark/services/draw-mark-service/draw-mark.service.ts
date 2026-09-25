import { reportError } from '@global/lib/report-error.lib';
import { Injectable, computed, effect, linkedSignal, signal, untracked } from '@angular/core';
import * as Cesium from 'cesium';
import cloneDeep from 'lodash/cloneDeep';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import {
  ToolsService,
  cartesianFromProperty,
  stringFromProperty,
} from '@/components/tools/services/tools-service/tools.service';
import { CursorCoordsService } from '@/common/services/cursor-coords-service/cursor-coords.service';
import {
  DrawingService,
  getRusDrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import type {
  DrawingOptions,
  DrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';

// Запровайден в planet.ts
@Injectable()
export class DrawMarkService {
  // --------------------- Блок для хранения основных состояний сервиса (start) ----------------------- //
  // Еще используется в draw-mark-floating-window.ts
  public readonly drawMarkEntitiesList = computed(() => this.$drawingService.drawMarkEntitiesList());
  // Еще используется в draw-mark.ts
  public readonly drawingsBlocker = computed(() => this.$toolsService.drawingsBlocker());
  private _isActive = signal<boolean>(false);
  // Еще используется в draw-mark.ts
  get isActive() {
    return this._isActive;
  }
  // --------------------- Блок для хранения основных состояний сервиса (end) ------------------------- //
  constructor(
    private $viewerService: ViewerService,
    private $cursorCoordsService: CursorCoordsService,
    private $drawingService: DrawingService,
    private $toolsService: ToolsService,
  ) {
    // ------------------ Блок логики автоматической деактивации инструмента (start) ------------------ //
    // effect(() => {
    //   try {
    //     const currentTerrainName = this._nowTerrainName();
    //     untracked(async () => {
    //       if (currentTerrainName === undefined) {
    //         const pickedEntity = this.$viewerService.viewer.newPickedEntity();
    //         if (pickedEntity) {
    //           const height = await this.$viewerService.getHeight(
    //             Cesium.Cartographic.fromCartesian(pickedEntity.position?.getValue() ?? Cesium.Cartesian3.ZERO),
    //           );
    //           const coords = await this.$toolsService.getPositionCoordsDescription(
    //             pickedEntity.position?.getValue(Cesium.JulianDate.now()),
    //             'WGS-84',
    //           );
    //           const newPosition = Cesium.Cartesian3.fromDegrees(
    //             Number(coords?.longitudeDescription.match(/-?\d+\.\d+/)?.[0]),
    //             Number(coords?.latitudeDescription.match(/-?\d+\.\d+/)?.[0]),
    //             height,
    //           );
    //           pickedEntity.position = newPosition;
    //           this._heightEntity.set(Number(height.toFixed(1)));
    //         }
    //       } else {
    //         const pickedEntity = this.$viewerService.viewer.newPickedEntity();
    //         if (pickedEntity !== undefined) {
    //           const height = await this.$viewerService.getHeight(
    //             Cesium.Cartographic.fromCartesian(pickedEntity.position?.getValue() ?? Cesium.Cartesian3.ZERO),
    //           );
    //           const coords = await this.$toolsService.getPositionCoordsDescription(
    //             pickedEntity.position?.getValue(Cesium.JulianDate.now()),
    //             'WGS-84',
    //           );
    //           const newPosition = Cesium.Cartesian3.fromDegrees(
    //             Number(coords?.longitudeDescription.match(/-?\d+\.\d+/)?.[0]),
    //             Number(coords?.latitudeDescription.match(/-?\d+\.\d+/)?.[0]),
    //             height,
    //           );
    //           pickedEntity.position = newPosition;
    //           this._heightEntity.set(Number(height.toFixed(1)));
    //         }
    //       }
    //     });
    //   } catch (error: unknown) {
    //     reportError(error);
    //   }
    // });
    effect(() => {
      try {
        if (this.drawMarkEntitiesList()) {
          untracked(() => {
            if (this.hasErasedAll()) {
              this.counter = 0;
              if (this.isActive() === true) {
                this.cancelThisTool();
              }
            }
          });
        }
      } catch (error: unknown) {
        reportError(error);
      }
    });
  }

  private _heightEntity = signal<number>(0);
  get heightEntity() {
    return this._heightEntity;
  }

  private readonly marksGroupsCounter = computed<number>(() => this.drawMarkEntitiesList().length);
  private readonly hasErasedAll = linkedSignal<number, boolean>({
    source: this.marksGroupsCounter,
    computation(newVal, prevVal) {
      return prevVal && !newVal ? true : false;
    },
  });
  // Еще используется в draw-mark.ts
  public cancelThisTool(): void {
    try {
      this.$drawingService.cancelDrawingTool(); // общая функция отмены сценария любого из инструментов работы с картой
    } catch (error: unknown) {
      reportError(error);
    } finally {
      this.isActive.set(false);
    }
  }
  // ------------------ Блок логики автоматической деактивации инструмента (end) -------------------- //

  // -------------------------- Блок отработки кнопки инструмента (start) --------------------------- //
  // Еще используется в draw-mark-floating-window.service.ts
  public readonly toolName: DrawingToolName = 'drawMark';
  // Используется в draw-mark.ts
  public buttonHandler(event: MouseEvent): void {
    // event.stopPropagation(); // не применять! (событие также ловится в родителе (drawing-tools.ts))
    if (event.button === 0) {
      this.toggleDrawing();
    } else if (event.button === 1) {
      if (this.marksGroupsCounter() !== 0) {
        this.$drawingService.allToolEntitiesCleaning(this.toolName); // cancelThisTool() сработает по эффекту
      }
      this.cancelThisTool();
    }
  }
  private toggleDrawing(): void {
    try {
      if (this.isActive() === false && !this.drawingsBlocker()) {
        this.isActive.set(true);
        this.drawPointGraphics(this.optForMark);
      } else if (this.isActive() === true) {
        this.cancelThisTool();
      }
    } catch (error: unknown) {
      reportError(error);
      this.cancelThisTool();
    }
  }
  // -------------------------- Блок отработки кнопки инструмента (end) ----------------------------- //

  private counter: number = 0;
  // Вынесено в общий доступ, т.к. используется и в других конструкторах сущностей
  public readonly optForMark: DrawingOptions = {
    reuse: true,
    randomColor: true,
    toolName: this.toolName, // important!
    name: getRusDrawingToolName(this.toolName), // актуализируется в момент построения сущности
    clampToGround: true,
    // Точка (свойство point) не отображается на некоторых видеокартах (заменена билбордом)
    billboard: {
      image: 'assets/planet/drawings-tools/map-position_white.png',
      height: 32, // как в .kml (оригинальный размер метки 64x64)
      width: 32,
      color: Cesium.Color.CHOCOLATE.withAlpha(1),
      scaleByDistance: new Cesium.NearFarScalar(2414016, 1, 16093000, 0.1), // как в .kml
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      // disableDepthTestDistance: Number.POSITIVE_INFINITY, // будет просвечивать сквозь рельеф
      disableDepthTestDistance: undefined, // будет перекрываться рельефом (при clampToGround)
      // heightReference конфликтует с 2d и 2.5d режимами использования карты
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
    label: {
      show: true,
      text: getRusDrawingToolName(this.toolName), // актуализируется в момент построения сущности
      showBackground: true,
      backgroundColor: undefined,
      font: '16px sans-serif', // как в .kml
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
    properties: {
      systemCoords: 'WGS-84', // актуализируется в момент построения сущности
      numericId: undefined,
    },
  };

  // --------------------- Блок работы с Cesium-сущностями инструмента (start) ---------------------- //
  // Main-функция инструмента draw-mark.ts
  public drawPointGraphics(options: DrawingOptions = {}): boolean {
    try {
      if (this.$toolsService.drawingsBlocker() === true) return false;
      this.$toolsService.clearCommonHandler();
      this.$toolsService.setDrawingsBlocker(true);

      const addNewMark = async (movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        try {
          this.$viewerService.onEntityPickingBlock();
          const groupIdChunk: string = `${Math.ceil(Math.random() * 1000000)}`; // используется для смыслового объединения всех сущностей одного сценария работы инструмента (groupId)
          const optForPoint: DrawingOptions = cloneDeep(options);
          // Начало id должно быть общим для суммы сущностей одного сценария работы инструмента (для коллективного удаления)
          optForPoint.id = `${groupIdChunk}-${this.toolName}-point-${Math.ceil(Math.random() * 1000000)}`;
          if (!options?.name) optForPoint.name = 'Метка'; // контрольное присвоение

          let mouseEntity: Cesium.Entity | undefined = undefined;
          let pos: Cesium.Cartesian3 | undefined = undefined;
          if (this.$toolsService.isMobile && movement?.position instanceof Cesium.Cartesian2) {
            const touchPosition: Cesium.Cartesian2 = movement.position;
            if (touchPosition.x && touchPosition.y) {
              pos = this.$viewerService?.viewer?.scene?.pickPosition(touchPosition);
              if (pos && pos instanceof Cesium.Cartesian3) {
                pos = await this.$toolsService.getDetailedPosition(pos);
              }
            }
          } else {
            mouseEntity = await this.$toolsService.getMouseEntity(true);
            pos = cartesianFromProperty(mouseEntity?.position?.getValue());
          }
          if (pos === undefined) {
            // throw new Error('Start position is undefined in drawPointGraphics()');
            this.cancelThisTool();
            return;
          }

          if (optForPoint?.billboard) {
            optForPoint.billboard.color = options?.color
              ? options?.color
              : options?.randomColor
                ? Cesium.Color.fromHsl(Math.random(), 1.0, 0.5, 1.0) // в модели HSL чистому яркому цвету соответствует Lightness = 0.5
                : // : Cesium.Color.fromRandom({
                  //     minimumRed: 0.5,
                  //     minimumGreen: 0.5,
                  //     minimumBlue: 0.5,
                  //     alpha: 1.0,
                  //   }),
                  Cesium.Color.CHOCOLATE.withAlpha(1); // withAlpha < 1 конфликтует с css hex color html инпута
          }
          optForPoint.properties = {
            systemCoords: this.$cursorCoordsService.selectedCrs(), // актуализация
            numericId: undefined,
          };

          this.counter++;
          optForPoint.name = `${optForPoint.name || getRusDrawingToolName(this.toolName)} ${this.counter}`;
          if (optForPoint?.label) {
            if (optForPoint.withCoordsDesc) {
              const cursorLabel = stringFromProperty(mouseEntity?.label?.text?.getValue());
              optForPoint.label.text = cursorLabel || 'coords description error'; // актуализация
            } else {
              optForPoint.label.text = optForPoint.name;
            }
          }

          const pointEntity = this.$toolsService.setPointEntity(pos, optForPoint);

          if (pointEntity === undefined) return;

          this.$drawingService.pushGroupWithoutTemporalWithDrawing(
            [pointEntity],
            groupIdChunk,
            optForPoint?.toolName,
            pointEntity,
          );
          this.$viewerService.setNewPickedEntity(pointEntity);

          this.$viewerService.offEntityPickingBlock();
          this.$toolsService.setDrawingsBlocker(false);
          if (options.reuse === true) {
            this.drawPointGraphics(options);
          } else this.cancelThisTool();
        } catch (error: unknown) {
          this.cancelThisTool();
          reportError(error);
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      this.$toolsService.createNewCommonHandler(this.toolName);
      this.$toolsService.setCommonHandler(addNewMark, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      // Сервис с перетаскиванием
      this.$toolsService.setCommonHandler(
        () => this.cancelThisTool(),
        Cesium.ScreenSpaceEventType.RIGHT_CLICK,
      );

      return true;
    } catch (error: unknown) {
      this.cancelThisTool();
      reportError(error);
      alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
      return false;
    }
  }

  // private _nowTerrainName = computed<string | undefined>(() => this.$toolsService.nowTerrainName());
  // // Используется в draw-mark-floating-window.html
  // get nowTerrainName() {
  //   return this._nowTerrainName;
  // }
}
