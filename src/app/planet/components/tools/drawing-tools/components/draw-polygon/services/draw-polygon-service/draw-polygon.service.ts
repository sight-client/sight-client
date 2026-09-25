import { reportError } from '@global/lib/report-error.lib';
import { Injectable, computed, effect, linkedSignal, signal, untracked } from '@angular/core';
import * as Cesium from 'cesium';
import cloneDeep from 'lodash/cloneDeep';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import {
  ToolsService,
  cartesianFromProperty,
  stringFromProperty,
  booleanFromProperty,
} from '@/components/tools/services/tools-service/tools.service';
import {
  DrawingService,
  getRusDrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import type {
  DrawingOptions,
  DrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import * as MeasuresLib from '@/components/tools/lib/basic-measure-calculations.lib';

// Запровайден в planet.ts
@Injectable()
export class DrawPolygonService {
  // --------------------- Блок для хранения основных состояний сервиса (start) ----------------------- //
  // Еще используется в draw-polygon-floating-window.ts
  public readonly drawPolygonEntitiesList = computed(() =>
    this.$drawingService.drawPolygonEntitiesList(),
  );
  // Еще используется в draw-polygon.ts
  public readonly drawingsBlocker = computed(() => this.$toolsService.drawingsBlocker());
  private _isActive = signal<boolean>(false);
  // Еще используется в draw-polygon.ts
  get isActive() {
    return this._isActive;
  }
  private _drawingHasStarted = signal<boolean>(false);
  get drawingHasStarted() {
    return this._drawingHasStarted;
  }
  // --------------------- Блок для хранения основных состояний сервиса (end) ------------------------- //
  constructor(
    private $viewerService: ViewerService,
    private $drawingService: DrawingService,
    private $toolsService: ToolsService,
  ) {
    // ------------------ Блок логики автоматической деактивации инструмента (start) ------------------ //
    effect(() => {
      try {
        if (this.drawPolygonEntitiesList()) {
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
  private readonly drawPolygonGroupsCounter = computed<number>(
    () => this.drawPolygonEntitiesList().length,
  );
  private readonly hasErasedAll = linkedSignal<number, boolean>({
    source: this.drawPolygonGroupsCounter,
    computation(newVal, prevVal) {
      return prevVal && !newVal ? true : false;
    },
  });
  // Еще используется в draw-polygon.ts
  public cancelThisTool(): void {
    try {
      if (this._isActive() && this.counter > 0) this.counter--;
      this.$drawingService.cancelDrawingTool(); // общая функция отмены сценария любого из инструментов работы с картой
    } catch (error: unknown) {
      reportError(error);
    } finally {
      this._drawingHasStarted.set(false);
      this.isActive.set(false);
    }
  }
  // ------------------ Блок логики автоматической деактивации инструмента (end) -------------------- //

  // -------------------------- Блок отработки кнопки инструмента (start) --------------------------- //
  // Еще используется в draw-polygon-floating-window.service.ts
  public readonly toolName: DrawingToolName = 'drawPolygon';
  // Используется в draw-polygon.ts
  public buttonHandler(event: MouseEvent): void {
    // event.stopPropagation(); // не применять! (событие также ловится в родителе (drawing-tools.ts))
    if (event.button === 0) {
      this.toggleDrawing();
    } else if (event.button === 1) {
      if (this._drawingHasStarted() === false) {
        this.$drawingService.allToolEntitiesCleaning(this.toolName); // cancelThisTool() сработает по эффекту
      } else {
        this.$drawingService.removeTemporalEntities();
        if (this.drawPolygonGroupsCounter()) {
          this.$drawingService.allToolEntitiesCleaning(this.toolName);
        } else this.cancelThisTool();
      }
    }
  }
  private toggleDrawing(): void {
    try {
      if (this.isActive() === false && !this.drawingsBlocker()) {
        this.isActive.set(true);
        this.drawPolygonalAreaDrawingGraphics({
          toolName: this.toolName,
          name: getRusDrawingToolName(this.toolName),
          reuse: true,
          randomColor: false,
          clampToGround: true,
        });
      } else if (this.isActive() === true) {
        if (this._drawingHasStarted() === true) {
          this.$drawingService.removeTemporalEntities();
        }
        this.cancelThisTool();
      }
    } catch (error: unknown) {
      reportError(error);
      this.cancelThisTool();
    }
  }
  // -------------------------- Блок отработки кнопки инструмента (end) ----------------------------- //

  // --------------------- Блок работы с Cesium-сущностями инструмента (start) ---------------------- //
  private counter: number = 0;
  // Main-функция настоящего инструмента
  private drawPolygonalAreaDrawingGraphics(options: DrawingOptions = {}): boolean {
    try {
      if (this.$toolsService.drawingsBlocker() === true) return false;
      this.$toolsService.clearCommonHandler();
      this.$toolsService.setDrawingsBlocker(true);
      let groupIdChunk: string;
      if (options?.groupId === undefined) {
        groupIdChunk = `${Math.ceil(Math.random() * 1000000)}`;
      } else {
        groupIdChunk = options.groupId;
      }
      const optForPolygon: DrawingOptions = cloneDeep(options);
      // Начало id должно быть общим для суммы сущностей одного сценария работы инструмента
      optForPolygon.id = `${groupIdChunk}-${this.toolName}-polygon-${Math.ceil(Math.random() * 1000000)}`;
      this.counter++;
      optForPolygon.name = `${options.name || getRusDrawingToolName(this.toolName)} ${this.counter}`;
      const labelTextGagOne: string = 'Начальная точка';
      const labelTextGagTwo: string = 'Ожидание окончания построения...';
      const labelText: string = optForPolygon.name;

      if (optForPolygon?.label) {
        optForPolygon.label.text = this.$toolsService.isMobile ? labelTextGagOne : labelText;
        optForPolygon.label.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
        optForPolygon.label.verticalOrigin = Cesium.VerticalOrigin.TOP;
        optForPolygon.label.pixelOffset = new Cesium.Cartesian2(0, -30);
      } else {
        optForPolygon.label = {
          text: this.$toolsService.isMobile ? labelTextGagOne : labelText,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, -30),
        };
      }
      if (this.$toolsService.isMobile) {
        optForPolygon.point = {
          ...{
            show: true,
            outline: true,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 1,
          },
          ...options?.point,
        };
      }

      let polygonEntity: Cesium.Entity | undefined = undefined;
      let startPos: Cesium.Cartesian3 | undefined = undefined;

      const polygonHierarchy: Cesium.PolygonHierarchy = new Cesium.PolygonHierarchy(); // polygon
      // "Сигналы" для колбэков ниже
      let polylinePositions: Array<Cesium.Cartesian3> = []; // positions
      let labelPosition: Cesium.Cartesian3 = Cesium.Cartesian3.ZERO; // positionForPolygonEntity
      // Присваиваются параметрам polygonEntity после ее создания
      const reactivePolylinePositions: Cesium.CallbackProperty = new Cesium.CallbackProperty(
        () => polylinePositions,
        false,
      );
      const reactiveLabelPosition: Cesium.CallbackPositionProperty =
        new Cesium.CallbackPositionProperty(() => labelPosition, false);

      // ЛКМ (получение startPos, создание, отображение и добавление во временную коллекцию новой polygonEntity; илм добавление новой полилинии к ней)
      const startDrawing = async (
        movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent,
      ): Promise<void> => {
        try {
          // Первый клик ЛКМ
          if (polygonEntity === undefined) {
            if (this._drawingHasStarted() === false) this._drawingHasStarted.set(true);
            if (this.$viewerService.entityPickingBlock() === false)
              this.$viewerService.onEntityPickingBlock();

            let mouseEntity: Cesium.Entity | undefined = undefined;
            if (this.$toolsService.isMobile && movement?.position instanceof Cesium.Cartesian2) {
              const touchPosition: Cesium.Cartesian2 = movement.position;
              if (touchPosition.x && touchPosition.y) {
                startPos = this.$viewerService?.viewer?.scene?.pickPosition(touchPosition);
                if (startPos && startPos instanceof Cesium.Cartesian3) {
                  startPos = await this.$toolsService.getDetailedPosition(startPos);
                }
              }
            } else {
              mouseEntity = await this.$toolsService.getMouseEntity(true);
              startPos = cartesianFromProperty(mouseEntity?.position?.getValue());
            }
            if (startPos === undefined) {
              // throw new Error('Start position is undefined in drawPolygonalAreaDrawingGraphics()');
              this.cancelThisTool();
              return;
            }
            const movePos = startPos.clone();
            if (polylinePositions.length !== 0) {
            } else {
              polylinePositions = [];
            }
            if (polygonHierarchy.positions.length !== 0) {
            } else {
              polygonHierarchy.positions = [];
            }
            polygonHierarchy.positions = [startPos, movePos];
            polylinePositions = [startPos, movePos];
            labelPosition = movePos;

            polygonEntity = this.$toolsService.setPolygonEntity(
              polylinePositions,
              labelPosition,
              this.$toolsService.isMobile ? labelTextGagOne : labelText,
              polygonHierarchy,
              optForPolygon,
            );
            if (polygonEntity) {
              if (
                this.$drawingService
                  .temporalEntitiesList()
                  .findIndex((item) => item?.id === polygonEntity?.id) !== -1
              ) {
                throw new Error('Entity already exists in temporal store by setPolygonEntity()');
              }
              if (polygonEntity.polyline?.positions)
                polygonEntity.polyline.positions = reactivePolylinePositions;
              if (polygonEntity.position) polygonEntity.position = reactiveLabelPosition;

              this.$drawingService.addNewEntityToDrawLayer(polygonEntity);
              this.$drawingService.temporalEntitiesList.update((arr) => [...arr, polygonEntity]);
            }
            // Последующие клики ЛКМ
          } else {
            let mouseEntity: Cesium.Entity | undefined = undefined;
            let newPos: Cesium.Cartesian3 | undefined = undefined;
            if (this.$toolsService.isMobile && movement?.position instanceof Cesium.Cartesian2) {
              const touchPosition: Cesium.Cartesian2 = movement.position;
              if (touchPosition.x && touchPosition.y) {
                newPos = this.$viewerService?.viewer?.scene?.pickPosition(touchPosition);
                if (newPos && newPos instanceof Cesium.Cartesian3) {
                  newPos = await this.$toolsService.getDetailedPosition(newPos);
                }
              }
            } else {
              mouseEntity = await this.$toolsService.getMouseEntity(true);
              newPos = cartesianFromProperty(mouseEntity?.position?.getValue());
            }
            if (newPos === undefined) {
              // throw new Error('New position is undefined in drawPolygonalAreaDrawingGraphics()');
              this.cancelThisTool();
              return;
            }
            if (Cesium.Cartesian3.equals(polylinePositions[polylinePositions.length - 1], newPos)) {
              console.info('Next & start positions are equal');
              return;
            }
            if (polylinePositions.length === 4) {
              if (polygonEntity?.label) {
                if (
                  this.$toolsService.isMobile &&
                  stringFromProperty(polygonEntity.label.text?.getValue()) !== labelTextGagTwo
                ) {
                  polygonEntity.label.text = new Cesium.ConstantProperty(labelTextGagTwo);
                }
                polygonEntity.label.horizontalOrigin = new Cesium.ConstantProperty(
                  Cesium.HorizontalOrigin.LEFT,
                );
                polygonEntity.label.verticalOrigin = new Cesium.ConstantProperty(
                  Cesium.VerticalOrigin.BOTTOM,
                );
                polygonEntity.label.pixelOffset = new Cesium.ConstantProperty(
                  new Cesium.Cartesian2(-20, -40),
                );
                if (
                  this.$toolsService.isMobile &&
                  polygonEntity?.point &&
                  booleanFromProperty(polygonEntity.point.show?.getValue()) === true
                ) {
                  polygonEntity.point.show = new Cesium.ConstantProperty(false);
                }
              }
            }
            if (polylinePositions.length > 2) {
              labelPosition = newPos;
            }
            polylinePositions.push(newPos);
            polylinePositions.push(newPos.clone());
            polygonHierarchy.positions.push(newPos);
            polygonHierarchy.positions.push(newPos.clone());
          }
        } catch (error: unknown) {
          this.cancelThisTool();
          reportError(error);
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      this.$toolsService.createNewCommonHandler(this.toolName);
      // Notice: все события вешаются на мышку одновременно
      this.$toolsService.setCommonHandler(startDrawing, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // Перемещение курсора (применение новой movePos к параметрам polygonEntity через ранее привязанные Cesium.CallbackProperty)
      const continueDrawing = async (
        movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent,
      ): Promise<void> => {
        try {
          if (!startPos) return;
          if (polylinePositions.length < 2) return;
          let mouseEntity: Cesium.Entity | undefined = undefined;
          let movePos: Cesium.Cartesian3 | undefined = undefined;
          if (this.$toolsService.isMobile && movement?.position instanceof Cesium.Cartesian2) {
            // const touchPosition: Cesium.Cartesian2 = movement.position;
            // if (touchPosition.x && touchPosition.y) {
            //   movePos = this.$viewerService?.viewer?.scene?.pickPosition(touchPosition);
            //   if (movePos && movePos instanceof Cesium.Cartesian3) {
            //     movePos = await this.$toolsService.getDetailedPosition(movePos);
            //   }
            // }
            // if (polygonEntity?.label && polygonEntity.label.text?.getValue() !== labelTextGagTwo) {
            //   polygonEntity.label.text = new Cesium.ConstantProperty(labelTextGagTwo);
            // }
          } else {
            mouseEntity = await this.$toolsService.getMouseEntity(true);
            movePos = cartesianFromProperty(mouseEntity?.position?.getValue());
          }
          if (movePos === undefined) return;

          labelPosition = movePos;
          polylinePositions.pop();
          polylinePositions.push(movePos);
          polygonHierarchy.positions.pop();
          polygonHierarchy.positions.push(movePos);
        } catch (error: unknown) {
          this.cancelThisTool();
          reportError(error);
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      if (!this.$toolsService.isMobile) {
        this.$toolsService.setCommonHandler(
          continueDrawing,
          Cesium.ScreenSpaceEventType.MOUSE_MOVE,
        );
      }

      // ПКМ (перенос polygonEntity из временного в свой стор)
      const finishDrawing = async (
        _movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent,
      ): Promise<void> => {
        try {
          if (this._drawingHasStarted() === false || polylinePositions.length < 3) {
            // console.log('Отмена сценария');
            this.cancelThisTool();
            return;
          }
          this.$viewerService.offEntityPickingBlock();

          if (polygonEntity === undefined) {
            throw new Error('Entity is not defined in drawPolygonalAreaDrawingGraphics()');
          }
          if (startPos === undefined) {
            // throw new Error('Start position is undefined in drawPolygonalAreaDrawingGraphics()');
            this.cancelThisTool();
            return;
          }
          // Значения (с точной координатой) уже получены в continueMeasure-хэндлере
          // let mouseEntity: Cesium.Entity | undefined = undefined;
          // let endPos: Cesium.Cartesian3 | undefined = undefined;
          if (
            this.$toolsService.isMobile
            // && movement?.position instanceof Cesium.Cartesian2
          ) {
            // const touchPosition: Cesium.Cartesian2 = movement.position;
            // if (touchPosition.x && touchPosition.y) {
            //   endPos = this.$viewerService?.viewer?.scene?.pickPosition(touchPosition);
            //   if (endPos && endPos instanceof Cesium.Cartesian3) {
            //     endPos = await this.$toolsService.getDetailedPosition(endPos);
            //   }
            // }
            if (polygonEntity?.label && stringFromProperty(polygonEntity.label.text?.getValue()) !== labelText) {
              polygonEntity.label.text = new Cesium.ConstantProperty(labelText);
            }
          } else {
            // mouseEntity = await this.$toolsService.getMouseEntity(true);
            // endPos = mouseEntity?.position?.getValue();
          }
          // if (endPos === undefined) {
          //   // throw new Error('End position is undefined in drawPolygonalAreaDrawingGraphics()');
          //   this.cancelThisTool();
          //   return;
          // }
          // if (Cesium.Cartesian3.equals(startPos, endPos)) {
          //   console.info('End & start positions are equal');
          //   this.cancelThisTool();
          //   return;
          // }
          // labelPosition = endPos;
          // polylinePositions.pop();
          // polylinePositions.push(endPos);
          // polygonHierarchy.positions.pop();
          // polygonHierarchy.positions.push(endPos);

          if (Cesium.Cartesian3.equals(startPos, polylinePositions[polylinePositions.length - 1])) {
            console.info('End & start positions are equal');
            this.cancelThisTool();
            return;
          }
          // Замыкаем фигуру многоугольника
          polylinePositions.push(startPos.clone());
          polygonHierarchy.positions.push(startPos.clone());

          this.$drawingService.pushGroupFromTemporal(
            groupIdChunk,
            options?.toolName,
            polygonEntity,
          );
          this.$drawingService.clearTemporalEntitiesList(groupIdChunk);
          this.$viewerService.setNewPickedEntity(polygonEntity);

          this.$toolsService.setDrawingsBlocker(false);
          if (options?.callback && typeof options.callback === 'function') {
            options.callback();
          }
          if (this._drawingHasStarted() === true) this._drawingHasStarted.set(false);
          this.$drawingService.setEntityConstants(polygonEntity.id);
          if (options.reuse === true) {
            this.drawPolygonalAreaDrawingGraphics(options);
          } else this.cancelThisTool();
        } catch (error: unknown) {
          this.cancelThisTool();
          reportError(error);
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      this.$toolsService.setCommonHandler(finishDrawing, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

      return true;
    } catch (error: unknown) {
      this.cancelThisTool();
      reportError(error);
      alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
      return false;
    }
  }
  // --------------------- Блок работы с Cesium-сущностями инструмента (end) ------------------------ //
}
