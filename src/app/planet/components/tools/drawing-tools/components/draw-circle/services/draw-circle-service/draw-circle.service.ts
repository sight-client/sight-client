import { Injectable, computed, effect, linkedSignal, signal, untracked } from '@angular/core';
import * as Cesium from 'cesium';
import chalk from 'chalk';
import cloneDeep from 'lodash/cloneDeep';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { ToolsService, getCircle } from '@/components/tools/services/tools-service/tools.service';
import {
  DrawingService,
  getRusDrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import type {
  DrawingOptions,
  DrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import * as MeasuresLib from '@/components/tools/lib/basic-measure-calculations.lib';
import * as Humanify from '@/common/lib/humanify.lib';

// Запровайден в planet.ts
@Injectable()
export class DrawCircleService {
  // --------------------- Блок для хранения основных состояний сервиса (start) ----------------------- //
  // Еще используется в draw-circle-floating-window.ts
  public readonly drawCircleEntitiesList = computed(() =>
    this.$drawingService.drawCircleEntitiesList(),
  );
  // Еще используется в draw-circle.ts
  public readonly drawingsBlocker = computed(() => this.$toolsService.drawingsBlocker());
  private _isActive = signal<boolean>(false);
  // Еще используется в draw-circle.ts
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
        if (this.drawCircleEntitiesList()) {
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
  private readonly circleAreaGroupsCounter = computed<number>(
    () => this.drawCircleEntitiesList().length,
  );
  private readonly hasErasedAll = linkedSignal<number, boolean>({
    source: this.circleAreaGroupsCounter,
    computation(newVal, prevVal) {
      return prevVal && !newVal ? true : false;
    },
  });
  // Еще используется в draw-circle.ts
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
  // Еще используется в draw-circle-floating-window.service.ts
  public readonly toolName: DrawingToolName = 'drawCircle';
  // Используется в draw-circle.ts
  public buttonHandler(event: MouseEvent): void {
    // event.stopPropagation(); // не применять! (событие также ловится в родителе (drawing-tools.ts))
    if (event.button === 0) {
      this.toggleDrawing();
    } else if (event.button === 1) {
      if (this._drawingHasStarted() === false) {
        this.$drawingService.allToolEntitiesCleaning(this.toolName); // cancelThisTool() сработает по эффекту
      } else {
        this.$drawingService.removeTemporalEntities();
        if (this.circleAreaGroupsCounter()) {
          this.$drawingService.allToolEntitiesCleaning(this.toolName);
        } else this.cancelThisTool();
      }
    }
  }
  private toggleDrawing(): void {
    try {
      if (this.isActive() === false && !this.drawingsBlocker()) {
        this.isActive.set(true);
        this.drawCircleAreaDrawingGraphics({
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
  private drawCircleAreaDrawingGraphics(options: DrawingOptions = {}): boolean {
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
      optForPolygon.id = `${groupIdChank}-${this.toolName}-ellipse-${Math.ceil(Math.random() * 1000000)}`;
      this.counter++;
      optForPolygon.name = `${options.name || getRusDrawingToolName(this.toolName)} ${this.counter}`;
      const labelTextGagOne: string = 'Центральная точка';
      const labelTextGagTwo: string = 'Ожидание окончания построения...';
      const labelTextMain: string = optForPolygon.name;
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
      optForPolygon.point = {
        ...{
          show: true,
          outline: true,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 1,
        },
        ...options?.point,
      };

      let ellipseEntity: Cesium.Entity | undefined = undefined;
      let startPos: Cesium.Cartesian3 | undefined = undefined;

      const polygonHierarchy: Cesium.PolygonHierarchy = new Cesium.PolygonHierarchy();
      // "Сигналы" для колбэков ниже
      // Для эллипса, по которому будет рассчитана полилиния для полигона (Cesium.Entity.ellipse.outline не поддерживает наложение на рельеф)
      let radiusVectorPositions: Array<Cesium.Cartesian3> = [];
      let polylinePositionsForCircle: Array<Cesium.Cartesian3> = [];
      // Присваиваются параметрам ellipseEntity после ее создания
      const reactivePolylinePositionsMain: Cesium.CallbackProperty = new Cesium.CallbackProperty(
        () => polylinePositionsForCircle,
        false,
      );
      const reactiveRadius = new Cesium.CallbackProperty(() => {
        if (radiusVectorPositions?.[0] && radiusVectorPositions?.[1]) {
          // По прямой (без учета эллипсоида и высоты точек)
          // return Cesium.Cartesian3.distance(radiusVectorPositions[0], radiusVectorPositions[1]);
          // По дуге (с учетом эллипсоида и высоты точек)
          return MeasuresLib.calculatePosDistancesWhithoutHumanify(radiusVectorPositions);
        } else return 0.0;
      }, false);

      // ЛКМ (получение startPos, создание, отображение и добавление во временную коллекцию новых сущностей)
      const startDrawing = async (
        movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent,
      ): Promise<void> => {
        try {
          if (ellipseEntity !== undefined && !this.$toolsService.isMobile) {
            return; // обработка лишних кликов
          }
          // Второй возможный клик
          if (ellipseEntity && this.$toolsService.isMobile) {
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
            // throw new Error('Start position is undefined in drawCircleAreaDrawingGraphics()');
            this.cancelThisTool();
            return;
          }
          const movePos = startPos.clone();

          if (radiusVectorPositions.length !== 0) {
            radiusVectorPositions = [];
          }
          radiusVectorPositions = [startPos, movePos];

          ellipseEntity = this.$toolsService.setEllipseEntity(
            radiusVectorPositions,
            startPos,
            this.$toolsService.isMobile ? labelTextGagOne : labelTextMain,
            0.0,
            0.0,
            Cesium.Cartographic.fromCartesian(startPos).height,
            optForPolygon,
          );

          if (ellipseEntity) {
            if (
              this.$drawingService
                .temporalEntitiesList()
                .findIndex((item) => item?.id === ellipseEntity?.id) !== -1
            ) {
              throw new Error('Entity already exist in temporal store by setEllipseEntity()');
            }

            // Добавление реактивности
            if (ellipseEntity.polyline?.positions)
              ellipseEntity.polyline.positions = reactivePolylinePositionsMain;
            if (ellipseEntity.ellipse) {
              ellipseEntity.ellipse.semiMinorAxis = reactiveRadius;
              ellipseEntity.ellipse.semiMajorAxis = reactiveRadius;
            }
            if (ellipseEntity.ellipse)
              ellipseEntity.ellipse.show = new Cesium.ConstantProperty(false); // необходим только для расчетов, плюс границы эллипса, формирующиеся обычно по двум точкам, будут "испорчены" новым "фантомом" окружности для полилинии
            // Для привязке к рельефу заливки теперь используем полигон, а не эллипс (radiusVectorPositions определяет и hierarchy.positions полигона)
            ellipseEntity.polygon = new Cesium.PolygonGraphics({
              material: new Cesium.ColorMaterialProperty(Cesium.Color.WHITE.withAlpha(0.3)),
              perPositionHeight: new Cesium.ConstantProperty(!options?.clampToGround),
              hierarchy: new Cesium.CallbackProperty(() => polygonHierarchy, false),
            });

            if (!labelTextMain && ellipseEntity?.label?.show?.getValue() === true) {
              ellipseEntity.label.show = new Cesium.ConstantProperty(false);
            }

            // Отрисовка сущностей и обновление временной коллекции
            this.$drawingService.addNewEntityToDrawLayer(ellipseEntity);
            this.$drawingService.temporalEntitiesList.update((arr) => [...arr, ellipseEntity]);
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

      // Перемещение курсора (применение новой movePos к параметрам сущностей через ранее привязанные Cesium.CallbackProperty)
      const continueDrawing = async (
        movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent,
      ): Promise<void> => {
        try {
          if (!startPos) return;
          if (radiusVectorPositions.length < 2) return;
          if (ellipseEntity === undefined) return;

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
            if (ellipseEntity?.label && ellipseEntity.label.text?.getValue() !== labelTextGagTwo) {
              ellipseEntity.label.text = new Cesium.ConstantProperty(labelTextGagTwo);
            }
          } else {
            mouseEntity = await this.$toolsService.getMouseEntity(true);
            movePos = mouseEntity?.position?.getValue();
          }
          if (movePos === undefined) return;
          radiusVectorPositions = [startPos, movePos];
          polylinePositionsForCircle = getCircle(ellipseEntity);
          if (polylinePositionsForCircle.length) {
            polygonHierarchy.positions = polylinePositionsForCircle;
          }
        } catch (error: unknown) {
          this.cancelThisTool();
          console.log(chalk.red(error));
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      this.$toolsService.setCommonHandler(continueDrawing, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      // ПКМ (перенос ellipseEntity из временного в свой стор)
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

          if (ellipseEntity === undefined) {
            throw new Error('Entity is not defined in drawCircleAreaDrawingGraphics()');
          }
          if (startPos === undefined) {
            // throw new Error('Start position is undefined in drawCircleAreaDrawingGraphics()');
            this.cancelThisTool();
            return;
          }

          if (
            this.$toolsService.isMobile
            //  && movement?.position instanceof Cesium.Cartesian2
          ) {
            // let endPos: Cesium.Cartesian3 | undefined = undefined;
            // const touchPosition: Cesium.Cartesian2 = movement.position;
            // if (touchPosition.x && touchPosition.y) {
            //   endPos = this.$viewerService?.viewer?.scene?.pickPosition(touchPosition);
            //   if (endPos && endPos instanceof Cesium.Cartesian3) {
            //     endPos = await this.$toolsService.getDetailedPosition(endPos);
            //   }
            // }
            // if (endPos === undefined) return;
            // radiusVectorPositions = [startPos, endPos];
            // polylinePositionsForCircle = getCircle(ellipseEntity);
            // if (polylinePositionsForCircle.length) {
            //   polygonHierarchy.positions = polylinePositionsForCircle;
            // }
            if (ellipseEntity?.label && ellipseEntity.label.text?.getValue() !== labelTextMain) {
              ellipseEntity.label.text = new Cesium.ConstantProperty(labelTextMain);
            }
          }

          if (
            Cesium.Cartesian3.equals(
              startPos,
              radiusVectorPositions[radiusVectorPositions.length - 1],
            )
          ) {
            console.log(chalk.blue('End & start positions are equal'));
            this.cancelThisTool();
            return;
          }
          this.$drawingService.pushGroupFromTemporal(
            groupIdChank,
            options?.toolName,
            ellipseEntity,
          );
          this.$drawingService.clearTemporalEntitiesList(groupIdChank);
          this.$viewerService.setNewPickedEntity(ellipseEntity);

          this.$toolsService.setDrawingsBlocker(false);
          if (options?.callback && typeof options.callback === 'function') {
            options.callback();
          }
          if (this._drawingHasStarted() === true) this._drawingHasStarted.set(false);
          this.$drawingService.setEntityConstants(ellipseEntity.id);
          if (options.reuse === true) {
            this.drawCircleAreaDrawingGraphics(options);
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
