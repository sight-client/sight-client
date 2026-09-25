import { reportError } from '@global/lib/report-error.lib';
import { Injectable, computed, effect, linkedSignal, signal, untracked } from '@angular/core';
import * as Cesium from 'cesium';
import cloneDeep from 'lodash/cloneDeep';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import {
  ToolsService,
  cartesianFromProperty,
  booleanFromProperty,
} from '@/components/tools/services/tools-service/tools.service';
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
export class CalculatePolygonService {
  // --------------------- Блок для хранения основных состояний сервиса (start) ----------------------- //
  // Еще используется в calculate-polygon-floating-window.ts
  public readonly calculatePolygonList = computed(() =>
    this.$measureService.calculatePolygonList(),
  );
  // Еще используется в calculate-polygon.ts
  public readonly measuresBlocker = computed(() => this.$toolsService.drawingsBlocker());
  private _isActive = signal<boolean>(false);
  // Еще используется в calculate-polygon.ts и в сервисе плавающего окна инструмента
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
        if (this.calculatePolygonList()) {
          untracked(() => {
            if (this.isActive() === true && this.hasErasedAll()) {
              this.cancelThisTool();
            }
          });
        }
      } catch (error: unknown) {
        reportError(error);
      }
    });
  }
  private readonly calculatePolygonGroupsCounter = computed<number>(
    () => this.calculatePolygonList().length,
  );
  private readonly hasErasedAll = linkedSignal<number, boolean>({
    source: this.calculatePolygonGroupsCounter,
    computation(newVal, prevVal) {
      return prevVal && !newVal ? true : false;
    },
  });
  // Еще используется в calculate-polygon.ts
  public cancelThisTool(): void {
    try {
      this.$measureService.cancelMeasuringTool(); // общая функция отмены сценария любого из инструментов работы с картой
    } catch (error: unknown) {
      reportError(error);
    } finally {
      this._measureHasStarted.set(false);
      this.isActive.set(false);
    }
  }
  // ------------------ Блок логики автоматической деактивации инструмента (end) -------------------- //

  // -------------------------- Блок отработки кнопки инструмента (start) --------------------------- //
  // Еще используется в calculate-polygon-floating-window.service.ts
  public readonly toolName: MeasuringToolName = 'calculatePolygon';
  // Используется в calculate-polygon.ts
  public buttonHandler(event: MouseEvent): void {
    // event.stopPropagation(); // не применять! (событие также ловится в родителе (measuring-tools.ts))
    if (event.button === 0) {
      this.toggleDrawing();
    } else if (event.button === 1) {
      if (this._measureHasStarted() === false) {
        this.$measureService.allToolEntitiesCleaning(this.toolName); // cancelThisTool() сработает по эффекту
      } else {
        this.$measureService.removeTemporalEntities();
        if (this.calculatePolygonGroupsCounter()) {
          this.$measureService.allToolEntitiesCleaning(this.toolName);
        } else this.cancelThisTool();
      }
    }
  }
  private toggleDrawing(): void {
    try {
      if (this.isActive() === false && !this.measuresBlocker()) {
        if (this.$measureService.isPolygons() === true) {
          // Отработает effect с cancelThisTool() в сервисе плавающего окна
          this.$measureService.allToolEntitiesCleaning(this.toolName);
          // Ждем его и перезапускаем
          setTimeout(this.toggleDrawing.bind(this), 100);
          return;
        }
        this.isActive.set(true);
        this.drawPolygonalAreaMeasureGraphics({
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
      reportError(error);
      this.cancelThisTool();
    }
  }
  // -------------------------- Блок отработки кнопки инструмента (end) ----------------------------- //

  // --------------------- Блок работы с Cesium-сущностями инструмента (start) ---------------------- //
  // Main-функция настоящего инструмента
  private drawPolygonalAreaMeasureGraphics(options: MeasureOptions = {}): boolean {
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
      const optForPolygon: MeasureOptions = cloneDeep(options);
      // Начало id должно быть общим для суммы сущностей одного сценария работы инструмента
      optForPolygon.id = `${groupIdChunk}-${this.toolName}-polygon-${Math.ceil(Math.random() * 1000000)}`;
      if (options?.name) optForPolygon.name = options.name; // при завершении сценария прибавится площадь

      let polygonEntity: Cesium.Entity | undefined = undefined;
      let startPos: Cesium.Cartesian3 | undefined = undefined;

      const polygonHierarchy: Cesium.PolygonHierarchy = new Cesium.PolygonHierarchy(); // polygon
      // "Сигналы" для колбэков ниже
      let polylinePositions: Array<Cesium.Cartesian3> = []; // positions
      let labelPosition: Cesium.Cartesian3 = Cesium.Cartesian3.ZERO; // positionForPolygonEntity
      const labelTextGag: string = 'Начальная точка';
      let labelText: string = this.$toolsService.isMobile ? labelTextGag : ''; // polygonAreaDescriptionDynamic
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

      // ЛКМ (получение startPos, создание, отображение и добавление во временную коллекцию новой polygonEntity; илм добавление новой полилинии к ней)
      const startMeasure = async (
        movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent,
      ): Promise<void> => {
        try {
          // Первый клик ЛКМ
          if (polygonEntity === undefined) {
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
              startPos = cartesianFromProperty(mouseEntity?.position?.getValue());
            }
            if (startPos === undefined) {
              // throw new Error('Start position is undefined in drawPolygonalAreaMeasureGraphics()');
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
                throw new Error('Entity already exists in temporal store by setPolygonEntity()');
              }
              if (polygonEntity.polyline?.positions)
                polygonEntity.polyline.positions = reactivePolylinePositions;
              if (polygonEntity.position) polygonEntity.position = reactiveLabelPosition;
              if (polygonEntity.label?.text) polygonEntity.label.text = reactiveLabelText;

              if (
                !labelText &&
                polygonEntity?.label &&
                booleanFromProperty(polygonEntity.label.show?.getValue()) === true
              ) {
                polygonEntity.label.show = new Cesium.ConstantProperty(false);
              }

              this.$measureService.addNewEntityToMeasureLayer(polygonEntity);
              this.$measureService.temporalEntitiesList.update((arr) => [...arr, polygonEntity]);
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
              // throw new Error('New position is undefined in drawPolygonalAreaMeasureGraphics()');
              this.cancelThisTool();
              return;
            }
            if (Cesium.Cartesian3.equals(polylinePositions[polylinePositions.length - 1], newPos)) {
              console.info('Next & start positions are equal');
              return;
            }
            if (polylinePositions.length === 4) {
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
            if (polylinePositions.length > 4) {
              // На плоскости
              // labelText = MeasuresLib.calculatePlaneArea(
              //   MeasuresLib.transformCartesianArrayToWGS84Array(polylinePositions),
              // );
              // На эллипсоиде
              labelText = MeasuresLib.calculateAreaWithTurf(polylinePositions);
            }
          }
        } catch (error: unknown) {
          this.cancelThisTool();
          reportError(error);
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      this.$toolsService.createNewCommonHandler(this.toolName);
      // Notice: все события вешаются на мышку одновременно
      this.$toolsService.setCommonHandler(startMeasure, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // Перемещение курсора (применение новой movePos к параметрам polygonEntity через ранее привязанные Cesium.CallbackProperty)
      const continueMeasure = async (
        movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent,
      ): Promise<void> => {
        try {
          if (!startPos) return;
          if (polylinePositions.length < 2) return;
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
            movePos = cartesianFromProperty(mouseEntity?.position?.getValue());
          }
          if (movePos === undefined) return;

          labelPosition = movePos;
          polylinePositions.pop();
          polylinePositions.push(movePos);
          polygonHierarchy.positions.pop();
          polygonHierarchy.positions.push(movePos);
          if (polylinePositions.length > 2) {
            // На плоскости
            // labelText = MeasuresLib.calculatePlaneArea(
            //   MeasuresLib.transformCartesianArrayToWGS84Array(polylinePositions),
            // );
            // На эллипсоиде
            labelText = MeasuresLib.calculateAreaWithTurf(polylinePositions);

            if (
              polygonEntity?.label &&
              booleanFromProperty(polygonEntity.label.show?.getValue()) === false &&
              labelText
            ) {
              polygonEntity.label.show = new Cesium.ConstantProperty(true);
            }
          }
        } catch (error: unknown) {
          this.cancelThisTool();
          reportError(error);
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      if (!this.$toolsService.isMobile) {
        this.$toolsService.setCommonHandler(
          continueMeasure,
          Cesium.ScreenSpaceEventType.MOUSE_MOVE,
        );
      }

      // ПКМ (перенос polygonEntity из временного в свой стор)
      const finishMeasure = async (
        _movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent,
      ): Promise<void> => {
        try {
          if (this._measureHasStarted() === false || polylinePositions.length < 3) {
            // console.log('Отмена сценария');
            this.cancelThisTool();
            return;
          }
          if (polygonEntity === undefined) {
            throw new Error('Entity is not defined in drawPolygonalAreaMeasureGraphics()');
          }
          if (startPos === undefined) {
            // throw new Error('Start position is undefined in drawPolygonalAreaMeasureGraphics()');
            this.cancelThisTool();
            return;
          }
          if (
            // Сценарий нажатий мышки в одной коорданате
            Cesium.Cartesian3.equals(startPos, polylinePositions[polylinePositions.length - 1])
          ) {
            console.info('End & start positions are equal');
            this.cancelThisTool();
            return;
          }
          this.$viewerService.offEntityPickingBlock();
          this.$toolsService.clearCommonHandler();

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
            // } else {
            //   mouseEntity = await this.$toolsService.getMouseEntity(true);
            //   endPos = mouseEntity?.position?.getValue();
          }
          // if (endPos === undefined)
          //   throw new Error('End position is undefined in drawPolygonalAreaMeasureGraphics()');
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

          if (polygonEntity?.label) {
            if (options?.name && polygonEntity.name) {
              polygonEntity.name = `${polygonEntity.name} ${labelText}`;
            }
            if (options?.hideLabel) {
              polygonEntity.label.show = new Cesium.ConstantProperty(false);
            }
          }

          this.$measureService.pushGroupFromTemporal(
            groupIdChunk,
            options?.toolName,
            polygonEntity,
          );
          this.$measureService.clearTemporalEntitiesList(groupIdChunk);
          this.$viewerService.setNewPickedEntity(polygonEntity);

          this.$toolsService.setDrawingsBlocker(false);
          if (options?.callback && typeof options.callback === 'function') {
            options.callback();
          }
          if (this._measureHasStarted() === true) this._measureHasStarted.set(false);
          this.cancelThisTool();
        } catch (error: unknown) {
          this.cancelThisTool();
          reportError(error);
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      this.$toolsService.setCommonHandler(finishMeasure, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

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
