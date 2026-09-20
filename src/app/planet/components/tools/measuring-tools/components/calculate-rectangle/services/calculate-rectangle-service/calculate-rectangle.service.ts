import { Injectable, computed, effect, linkedSignal, signal, untracked } from '@angular/core';
import * as Cesium from 'cesium';
import chalk from 'chalk';
import cloneDeep from 'lodash/cloneDeep';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import {
  MeasureService,
  getRusMeasuringToolName,
} from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import type {
  MeasureOptions,
  MeasuringToolName,
} from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import * as MeasuresLib from '@/components/tools/lib/basic-measure-calculations.lib';

// Запровайден в planet.ts
@Injectable()
export class CalculateRectangleService {
  // --------------------- Блок для хранения основных состояний сервиса (start) ----------------------- //
  // Еще используется в calculate-rectangle-floating-window.ts
  public readonly rectangleAreaMeasurmentsList = computed(() =>
    this.$measureService.rectangleAreaMeasurmentsList(),
  );
  // Еще используется в calculate-rectangle.ts
  public readonly measuresBlocker = computed(() => this.$toolsService.drawingsBlocker());
  private _isActive = signal<boolean>(false);
  // Еще используется в calculate-rectangle.ts и в сервисе плавающего окна инструмента
  get isActive() {
    return this._isActive;
  }
  private _measureHasStarted = signal<boolean>(false);
  get measureHasStarted() {
    return this._measureHasStarted;
  }
  // --------------------- Блок для хранения основных состояний сервиса (end) ------------------------- //
  constructor(
    private $viewerService: ViewerService,
    private $measureService: MeasureService,
    private $toolsService: ToolsService,
  ) {
    // ------------------ Блок логики автоматической деактивации инструмента (start) ------------------ //
    effect(() => {
      try {
        if (this.rectangleAreaMeasurmentsList()) {
          untracked(() => {
            if (this.isActive() === true && this.hasErasedAll()) {
              this.cancelThisTool();
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
  // Еще используется в calculate-rectangle.ts
  public cancelThisTool(): void {
    try {
      this.$measureService.cancelMeasuringTool(); // общая функция отмены сценария любого из инструментов работы с картой
    } catch (error: unknown) {
      console.log(chalk.red(error));
    } finally {
      this._measureHasStarted.set(false);
      this.isActive.set(false);
    }
  }
  // ------------------ Блок логики автоматической деактивации инструмента (end) -------------------- //

  // -------------------------- Блок отработки кнопки инструмента (start) --------------------------- //
  // Еще используется в calculate-rectangle-floating-window.service.ts
  public readonly toolName: MeasuringToolName = 'calculateRectangle';
  // Используется в calculate-rectangle.ts
  public buttonHandler(event: MouseEvent): void {
    // event.stopPropagation(); // не применять! (событие также ловится в родителе (measuring-tools.ts))
    if (event.button === 0) {
      this.toggleDrawing();
    } else if (event.button === 1) {
      if (this._measureHasStarted() === false) {
        this.$measureService.allToolEntitiesCleaning(this.toolName); // cancelThisTool() сработает по эффекту
      } else {
        this.$measureService.removeTemporalEntities();
        if (this.rectangleAreaGroupsCounter()) {
          this.$measureService.allToolEntitiesCleaning(this.toolName);
        } else this.cancelThisTool();
      }
    }
  }
  private toggleDrawing(): void {
    try {
      if (this.isActive() === false && !this.measuresBlocker()) {
        if (this.$measureService.isRectangles() === true) {
          // Отработает effect с cancelThisTool() в сервисе плавающего окна
          this.$measureService.allToolEntitiesCleaning(this.toolName);
          // Ждем его и перезапускаем
          setTimeout(this.toggleDrawing.bind(this), 100);
          return;
        }
        this.isActive.set(true);
        this.drawRectangleAreaMeasureGraphics({
          toolName: this.toolName,
          name: getRusMeasuringToolName(this.toolName),
          clampToGround: true,
          isMeasures: true,
        });
      } else if (this.isActive() === true) {
        if (this._measureHasStarted() === true) {
          this.$measureService.removeTemporalEntities();
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
  // Main-функция настоящего инструмента
  private drawRectangleAreaMeasureGraphics(options: MeasureOptions = {}): boolean {
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
      const optForPolygon: MeasureOptions = cloneDeep(options);
      // Начало id должно быть общим для суммы сущностей одного сценария работы инструмента
      optForPolygon.id = `${groupIdChank}-${this.toolName}-polygon-${Math.ceil(Math.random() * 1000000)}`;
      if (options?.name) optForPolygon.name = options.name; // при завершении сценария прибавится площадь

      let polygonEntity: Cesium.Entity | undefined = undefined;
      // let _rectangleEntity: Cesium.Entity | undefined = undefined;
      let startPos: Cesium.Cartesian3 | undefined = undefined;

      const polygonHierarchy: Cesium.PolygonHierarchy = new Cesium.PolygonHierarchy();
      // "Сигналы" для колбэков ниже
      let polylinePositions: Array<Cesium.Cartesian3> = [];
      let labelPosition: Cesium.Cartesian3 = Cesium.Cartesian3.ZERO;
      const labelTextGag: string = 'Начальная точка диагонали';
      let labelText: string = this.$toolsService.isMobile ? labelTextGag : '';
      if (optForPolygon?.label) {
        optForPolygon.label.text = this.$toolsService.isMobile ? labelTextGag : labelText;
        optForPolygon.label.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
        optForPolygon.label.verticalOrigin = Cesium.VerticalOrigin.TOP;
        optForPolygon.label.pixelOffset = new Cesium.Cartesian2(0, -30);
      } else {
        optForPolygon.label = {
          text: this.$toolsService.isMobile ? labelTextGag : labelText,
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
      // Присваиваются параметрам polygonEntity после ее создания
      const reactivePolylinePositions: Cesium.CallbackProperty = new Cesium.CallbackProperty(
        () => polylinePositions,
        false,
      );
      const reactiveLabelPosition: Cesium.CallbackPositionProperty =
        new Cesium.CallbackPositionProperty(() => labelPosition, false);
      const reactiveLabelText: Cesium.CallbackProperty = new Cesium.CallbackProperty(
        () => labelText,
        false,
      );

      // ЛКМ (получение startPos, создание, отображение и добавление во временную коллекцию новой polygonEntity)
      const startMeasure = async (
        movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent,
      ): Promise<void> => {
        try {
          if (polygonEntity !== undefined && !this.$toolsService.isMobile) {
            return; // обработка лишних кликов
          }
          // Второй возможный клик
          if (polygonEntity && this.$toolsService.isMobile) {
            continueMeasure(movement);
            return;
          }
          // Первый клик
          if (this._measureHasStarted() === false) this._measureHasStarted.set(true);
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
            // throw new Error('Start position is undefined in drawRectangleAreaMeasureGraphics()');
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
            labelText,
            polygonHierarchy,
            optForPolygon,
          );
          if (polygonEntity) {
            if (
              this.$measureService
                .temporalEntitiesList()
                .findIndex((item) => item?.id === polygonEntity?.id) !== -1
            ) {
              throw new Error('Entity already exist in temporal store by setPolygonEntity()');
            }
            if (polygonEntity.polyline?.positions)
              polygonEntity.polyline.positions = reactivePolylinePositions;
            if (polygonEntity.position) polygonEntity.position = reactiveLabelPosition;
            if (polygonEntity.label?.text) polygonEntity.label.text = reactiveLabelText;
            if (!labelText && polygonEntity?.label?.show?.getValue() === true) {
              polygonEntity.label.show = new Cesium.ConstantProperty(false);
            }

            this.$measureService.addNewEntityToMeasureLayer(polygonEntity);
            this.$measureService.temporalEntitiesList.update((arr) => [...arr, polygonEntity]);
          }
        } catch (error: unknown) {
          this.cancelThisTool();
          console.log(chalk.red(error));
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      this.$toolsService.createNewCommonHandler(this.toolName);
      // Notice: все события вешаются на мышку одновременно
      this.$toolsService.setCommonHandler(startMeasure, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      let counter = 0;
      // Перемещение курсора (применение новой movePos к параметрам polygonEntity через ранее привязанные Cesium.CallbackProperty)
      const continueMeasure = async (
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

          labelPosition = movePos;
          if (Cesium.Cartesian3.equals(startPos, movePos) === false) {
            polylinePositions = getRectangle(startPos, movePos);
            polygonHierarchy.positions = polylinePositions;
            // На плоскости
            // labelText = MeasuresLib.calculatePlaneArea(
            //   MeasuresLib.transformCartesianArrayToWGS84Array(polylinePositions),
            // );
            // На эллипсоиде
            labelText = MeasuresLib.calculateAreaWithTurf(polylinePositions);

            if (polygonEntity?.point && polygonEntity.point.show?.getValue() === true) {
              polygonEntity.point.show = new Cesium.ConstantProperty(false);
            }
            if (polygonEntity?.label?.show?.getValue() === false && labelText) {
              polygonEntity.label.show = new Cesium.ConstantProperty(true);
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
      this.$toolsService.setCommonHandler(continueMeasure, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      // ПКМ (перенос polygonEntity из временного в свой стор)
      const finishMeasure = async (
        _movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent,
      ): Promise<void> => {
        try {
          if (this._measureHasStarted() === false) {
            // console.log('Отмена сценария');
            this.cancelThisTool();
            return;
          }
          if (polygonEntity === undefined) {
            throw new Error('Entity is not defined in drawRectangleAreaMeasureGraphics()');
          }
          if (startPos === undefined) {
            // throw new Error('Start position is undefined in drawRectangleAreaMeasureGraphics()');
            this.cancelThisTool();
            return;
          }
          const startRect = getRectangle(startPos, startPos.clone());
          if (
            polylinePositions.length < 2 ||
            Cesium.Cartesian3.equals(polylinePositions[1], startRect[1])
          ) {
            console.log(chalk.blue('End & start positions are equal'));
            this.cancelThisTool();
            return;
          }
          this.$viewerService.offEntityPickingBlock();
          this.$toolsService.clearCommonHandler();

          // Значения (с точной координатой) уже получены в continueMeasure-хэндлере
          // let mouseEntity: Cesium.Entity | undefined = undefined;
          // let endPos: Cesium.Cartesian3 | undefined = undefined;
          // if (
          // this.$toolsService.isMobile
          //   && movement?.position instanceof Cesium.Cartesian2
          // ) {
          //   const touchPosition: Cesium.Cartesian2 = movement.position;
          //   if (touchPosition.x && touchPosition.y) {
          //     endPos = this.$viewerService?.viewer?.scene?.pickPosition(touchPosition);
          //     if (endPos && endPos instanceof Cesium.Cartesian3) {
          //       endPos = await this.$toolsService.getDetailedPosition(endPos);
          //     }
          //   }

          // } else {
          //   mouseEntity = await this.$toolsService.getMouseEntity(true);
          //   endPos = mouseEntity?.position?.getValue();
          // }
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
          // polylinePositions = getRectangle(startPos, endPos);
          // polygonHierarchy.positions = polylinePositions;

          if (polygonEntity?.label) {
            if (options?.name && polygonEntity.name) {
              polygonEntity.name = `${polygonEntity.name} ${labelText}`;
            }
            if (options?.hideLabel) {
              polygonEntity.label.show = new Cesium.ConstantProperty(false);
            }
          }

          this.$measureService.pushGroupFromTemporal(
            groupIdChank,
            options?.toolName,
            polygonEntity,
          );
          this.$measureService.clearTemporalEntitiesList(groupIdChank);
          this.$viewerService.setNewPickedEntity(polygonEntity);

          this.$toolsService.setDrawingsBlocker(false);
          if (options?.callback && typeof options.callback === 'function') {
            options.callback();
          }
          if (this._measureHasStarted() === true) this._measureHasStarted.set(false);
          this.cancelThisTool();
        } catch (error: unknown) {
          this.cancelThisTool();
          console.log(chalk.red(error));
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      this.$toolsService.setCommonHandler(finishMeasure, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

      return true;

      function getRectangle(
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
    } catch (error: unknown) {
      this.cancelThisTool();
      console.log(chalk.red(error));
      if (error instanceof Error) console.log(error.stack);
      alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
      return false;
    }
  }
  // --------------------- Блок работы с Cesium-сущностями инструмента (end) ------------------------ //
}
