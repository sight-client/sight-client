import { Injectable, computed, effect, linkedSignal, signal, untracked } from '@angular/core';
import * as Cesium from 'cesium';
import chalk from 'chalk';
import cloneDeep from 'lodash/cloneDeep';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import {
  ToolsService,
  getRectangle,
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
export class AddRectangleService {
  // --------------------- Блок для хранения основных состояний сервиса (start) ----------------------- //
  // Еще используется в add-rectangle-floating-window.ts
  public readonly rectangleAreaMeasurmentsList = computed(() =>
    this.$drawingService.addRectangleEntitiesList(),
  );
  // Еще используется в add-rectangle.ts
  public readonly drawingsBlocker = computed(() => this.$toolsService.drawingsBlocker());
  private _isActive = signal<boolean>(false);
  // Еще используется в add-rectangle.ts
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
        if (this.rectangleAreaMeasurmentsList()) {
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
        console.log(chalk.red(error));
      }
    });
  }
  private readonly rectangleAreaGroupsCounter = computed<number>(
    () => this.rectangleAreaMeasurmentsList().length,
  );
  private readonly hasErasedAll = linkedSignal<number, boolean>({
    source: this.rectangleAreaGroupsCounter,
    computation(newVal, prevVal) {
      return prevVal && !newVal ? true : false;
    },
  });
  // Еще используется в add-rectangle.ts
  public cancelThisTool(): void {
    try {
      if (this._isActive() && this.counter > 0) this.counter--;
      this.$drawingService.cancelDrawingTool(); // общая функция отмены сценария любого из инструментов работы с картой
    } catch (error: unknown) {
      console.log(chalk.red(error));
    } finally {
      this._drawingHasStarted.set(false);
      this.isActive.set(false);
    }
  }
  // ------------------ Блок логики автоматической деактивации инструмента (end) -------------------- //

  // -------------------------- Блок отработки кнопки инструмента (start) --------------------------- //
  // Еще используется в add-rectangle-floating-window.service.ts
  public readonly toolName: DrawingToolName = 'addRectangle';
  // Используется в add-rectangle.ts
  public buttonHandler(event: MouseEvent): void {
    // event.stopPropagation(); // не применять! (событие также ловится в родителе (drawing-tools.ts))
    if (event.button === 0) {
      this.toggleDrawing();
    } else if (event.button === 1) {
      if (this._drawingHasStarted() === false) {
        this.$drawingService.allToolEntitiesCleaning(this.toolName); // cancelThisTool() сработает по эффекту
      } else {
        this.$drawingService.removeTemporalEntities();
        if (this.rectangleAreaGroupsCounter()) {
          this.$drawingService.allToolEntitiesCleaning(this.toolName);
        } else this.cancelThisTool();
      }
    }
  }
  private toggleDrawing(): void {
    try {
      if (this.isActive() === false && !this.drawingsBlocker()) {
        this.isActive.set(true);
        this.drawRectangleAreaDrawingGraphics({
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
      console.log(chalk.red(error));
      this.cancelThisTool();
    }
  }
  // -------------------------- Блок отработки кнопки инструмента (end) ----------------------------- //

  // --------------------- Блок работы с Cesium-сущностями инструмента (start) ---------------------- //
  private counter: number = 0;
  // Main-функция настоящего инструмента
  private drawRectangleAreaDrawingGraphics(options: DrawingOptions = {}): boolean {
    try {
      if (this.$toolsService.drawingsBlocker() === true) return false;
      this.$toolsService.clearCommonHandler();
      this.$toolsService.setDrawingsBlocker(true);
      let groupIdChank: string;
      if (options?.groupId === undefined) {
        groupIdChank = `${Math.ceil(Math.random() * 1000000)}`;
      } else {
        groupIdChank = options.groupId;
      }
      const optForPolygon: DrawingOptions = cloneDeep(options);
      // Начало id должно быть общим для суммы сущностей одного сценария работы инструмента
      optForPolygon.id = `${groupIdChank}-${this.toolName}-polygon-${Math.ceil(Math.random() * 1000000)}`;
      this.counter++;
      optForPolygon.name = `${options.name || getRusDrawingToolName(this.toolName)} ${this.counter}`;
      const labelTextGagOne: string = 'Начальная точка диагонали';
      const labelTextGagTwo: string = 'Ожидание окончания построения...';
      const labelTextMain: string = optForPolygon.name;

      let polygonEntity: Cesium.Entity | undefined = undefined;
      let startPos: Cesium.Cartesian3 | undefined = undefined;

      if (optForPolygon?.label) {
        optForPolygon.label.text = this.$toolsService.isMobile ? labelTextGagOne : labelTextMain;
        optForPolygon.label.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
        optForPolygon.label.verticalOrigin = Cesium.VerticalOrigin.TOP;
        optForPolygon.label.pixelOffset = new Cesium.Cartesian2(0, -30);
      } else {
        optForPolygon.label = {
          text: this.$toolsService.isMobile ? labelTextGagOne : labelTextMain,
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

      const polygonHierarchy: Cesium.PolygonHierarchy = new Cesium.PolygonHierarchy();
      // "Сигналы" для колбэков ниже
      let polylinePositions: Array<Cesium.Cartesian3> = [];
      let labelPosition: Cesium.Cartesian3 = Cesium.Cartesian3.ZERO;
      // Присваиваются параметрам polygonEntity после ее создания
      const reactivePolylinePositions: Cesium.CallbackProperty = new Cesium.CallbackProperty(
        () => polylinePositions,
        false,
      );
      const reactiveLabelPosition: Cesium.CallbackPositionProperty =
        new Cesium.CallbackPositionProperty(() => labelPosition, false);

      // ЛКМ (получение startPos, создание, отображение и добавление во временную коллекцию новой polygonEntity)
      const startDrawing = async (
        movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent,
      ): Promise<void> => {
        try {
          if (polygonEntity !== undefined && !this.$toolsService.isMobile) {
            return; // обработка лишних кликов
          }
          // Второй возможный клик
          if (polygonEntity && this.$toolsService.isMobile) {
            continueDrawing(movement);
            return;
          }
          // Первый клик
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
            startPos = mouseEntity?.position?.getValue();
          }
          if (startPos === undefined) {
            // throw new Error('Start position is undefined in drawRectangleAreaDrawingGraphics()');
            this.cancelThisTool();
            return;
          }
          const movePos = startPos.clone();
          polylinePositions = getRectangle(startPos, movePos);
          polygonHierarchy.positions = polylinePositions;
          labelPosition = movePos;

          polygonEntity = this.$toolsService.setPolygonEntity(
            polylinePositions,
            labelPosition,
            this.$toolsService.isMobile ? labelTextGagOne : labelTextMain,
            polygonHierarchy,
            optForPolygon,
          );
          if (polygonEntity) {
            if (
              this.$drawingService
                .temporalEntitiesList()
                .findIndex((item) => item?.id === polygonEntity?.id) !== -1
            ) {
              throw new Error('Entity already exist in temporal store by setPolygonEntity()');
            }
            if (polygonEntity.polyline?.positions)
              polygonEntity.polyline.positions = reactivePolylinePositions;
            if (polygonEntity.position) polygonEntity.position = reactiveLabelPosition;

            this.$drawingService.addNewEntityToDrawLayer(polygonEntity);
            this.$drawingService.temporalEntitiesList.update((arr) => [...arr, polygonEntity]);
          }
        } catch (error: unknown) {
          this.cancelThisTool();
          console.log(chalk.red(error));
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      this.$toolsService.createNewCommonHandler(this.toolName);
      // Notice: все события вешаются на мышку одновременно
      this.$toolsService.setCommonHandler(startDrawing, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      let counter = 0;
      // Перемещение курсора (применение новой movePos к параметрам polygonEntity через ранее привязанные Cesium.CallbackProperty)
      const continueDrawing = async (
        movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent,
      ): Promise<void> => {
        try {
          if (!startPos) return;
          if (polylinePositions.length < 5) return;
          let mouseEntity: Cesium.Entity | undefined = undefined;
          let movePos: Cesium.Cartesian3 | undefined = undefined;
          if (this.$toolsService.isMobile && movement?.position instanceof Cesium.Cartesian2) {
            const touchPosition: Cesium.Cartesian2 = movement.position;
            if (touchPosition.x && touchPosition.y) {
              movePos = this.$viewerService?.viewer?.scene?.pickPosition(touchPosition);
              if (movePos && movePos instanceof Cesium.Cartesian3) {
                movePos = await this.$toolsService.getDetailedPosition(movePos);
              }
            }
          } else {
            mouseEntity = await this.$toolsService.getMouseEntity(true);
            movePos = mouseEntity?.position?.getValue();
          }
          if (movePos === undefined) return;

          if (Cesium.Cartesian3.equals(startPos, movePos) === false) {
            labelPosition = movePos;
            polylinePositions = getRectangle(startPos, movePos);
            polygonHierarchy.positions = polylinePositions;

            if (
              this.$toolsService.isMobile &&
              polygonEntity?.label &&
              polygonEntity.label.text?.getValue() !== labelTextGagTwo
            ) {
              polygonEntity.label.text = new Cesium.ConstantProperty(labelTextGagTwo);
            }
            if (
              this.$toolsService.isMobile &&
              polygonEntity?.point &&
              polygonEntity.point.show?.getValue() === true
            ) {
              polygonEntity.point.show = new Cesium.ConstantProperty(false);
            }
            if (counter === 0) {
              if (polygonEntity?.label) {
                polygonEntity.label.horizontalOrigin = new Cesium.ConstantProperty(
                  Cesium.HorizontalOrigin.LEFT,
                );
                polygonEntity.label.verticalOrigin = new Cesium.ConstantProperty(
                  Cesium.VerticalOrigin.BOTTOM,
                );
                polygonEntity.label.pixelOffset = new Cesium.ConstantProperty(
                  new Cesium.Cartesian2(-20, -40),
                );
              }
              counter++;
            }
          } else return;
        } catch (error: unknown) {
          this.cancelThisTool();
          console.log(chalk.red(error));
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      this.$toolsService.setCommonHandler(continueDrawing, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      // ПКМ (перенос polygonEntity из временного в свой стор)
      const finishDrawing = async (
        _movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent,
      ): Promise<void> => {
        try {
          if (this._drawingHasStarted() === false) {
            // console.log('Отмена сценария');
            this.cancelThisTool();
            return;
          }
          this.$viewerService.offEntityPickingBlock();

          if (polygonEntity === undefined) {
            throw new Error('Entity is not defined in drawRectangleAreaDrawingGraphics()');
          }
          if (startPos === undefined) {
            // throw new Error('Start position is undefined in drawRectangleAreaDrawingGraphics()');
            this.cancelThisTool();
            return;
          }
          const startRect = getRectangle(startPos, startPos.clone());
          if (Cesium.Cartesian3.equals(polylinePositions[1], startRect[1])) {
            console.log(chalk.blue('End & start positions are equal'));
            this.cancelThisTool();
            return;
          }
          // Значения (с точной координатой) уже получены в continueMeasure-хэндлере
          // let mouseEntity: Cesium.Entity | undefined = undefined;
          // let endPos: Cesium.Cartesian3 | undefined = undefined;
          if (
            this.$toolsService.isMobile
            //   && movement?.position instanceof Cesium.Cartesian2
          ) {
            //   const touchPosition: Cesium.Cartesian2 = movement.position;
            //   if (touchPosition.x && touchPosition.y) {
            //     endPos = this.$viewerService?.viewer?.scene?.pickPosition(touchPosition);
            //     if (endPos && endPos instanceof Cesium.Cartesian3) {
            //       endPos = await this.$toolsService.getDetailedPosition(endPos);
            //     }
            //   }
            if (polygonEntity?.label && polygonEntity.label.text?.getValue() !== labelTextMain) {
              polygonEntity.label.text = new Cesium.ConstantProperty(labelTextMain);
            }
            // } else {
            //   mouseEntity = await this.$toolsService.getMouseEntity(true);
            //   endPos = mouseEntity?.position?.getValue();
          }
          // if (endPos === undefined) {
          //   // throw new Error('End position is undefined in drawRectangleAreaDrawingGraphics()');
          //   this.cancelThisTool();
          //   return;
          // }
          // if (Cesium.Cartesian3.equals(startPos, endPos)) {
          //   console.log(chalk.blue('End & start positions are equal'));
          //   this.cancelThisTool();
          //   return;
          // }
          //   labelPosition = endPos;
          //   polylinePositions = getRectangle(startPos, endPos);
          //   polygonHierarchy.positions = polylinePositions;

          this.$drawingService.pushGroupFromTemporal(
            groupIdChank,
            options?.toolName,
            polygonEntity,
          );
          this.$drawingService.clearTemporalEntitiesList(groupIdChank);
          this.$viewerService.setNewPickedEntity(polygonEntity);

          this.$toolsService.setDrawingsBlocker(false);
          if (options?.callback && typeof options.callback === 'function') {
            options.callback();
          }
          if (this._drawingHasStarted() === true) this._drawingHasStarted.set(false);
          this.$drawingService.setEntityConstants(polygonEntity.id);
          if (options.reuse === true) {
            this.drawRectangleAreaDrawingGraphics(options);
          } else this.cancelThisTool();
        } catch (error: unknown) {
          this.cancelThisTool();
          console.log(chalk.red(error));
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      this.$toolsService.setCommonHandler(finishDrawing, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

      return true;
    } catch (error: unknown) {
      this.cancelThisTool();
      console.log(chalk.red(error));
      alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
      return false;
    }
  }
  // --------------------- Блок работы с Cesium-сущностями инструмента (end) ------------------------ //
}
