import { reportError } from '@global/lib/report-error.lib';
import { Injectable, computed, effect, linkedSignal, signal, untracked } from '@angular/core';
import * as Cesium from 'cesium';
import cloneDeep from 'lodash/cloneDeep';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import {
  ToolsService,
  cartesianFromProperty,
  cartesian3ListFromProperty,
} from '@/components/tools/services/tools-service/tools.service';
import {
  MeasureService,
  getRusMeasuringToolName,
} from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import type {
  MeasureOptions,
  MeasuringToolName,
} from '@/components/tools/measuring-tools/services/measure-service/measure.service';

import * as Humanify from '@/common/lib/humanify.lib';
import { MatCheckboxChange } from '@angular/material/checkbox';

// Сериализируется в string через JSON.stringify(calculationsCacheKey: CalculationsCacheKey)
type CalculationsCacheKey = {
  validEntityId: string | undefined;
  terrainName: string | undefined;
  distanceSegmentLengthM: number | undefined;
  distanceWithoutTerrain: number | undefined;
};
type CalculationsCacheValue = {
  distanceWithTerrain: number | undefined;
  distanceWithoutTerrain: number | undefined;
  points: Array<{ position: Cesium.Cartesian3; distance: number; distanceText: string }>;
};

// Запровайден в planet.ts
@Injectable()
export class CalculateLineService {
  constructor(
    private $viewerService: ViewerService,
    private $measureService: MeasureService,
    private $toolsService: ToolsService,
  ) {
    // ----------------- Блок логики поведения инструмента при смене рельефа (start) ------------------ //
    this.distanceSegmentLengthM.set(this.$viewerService.distanceSegmentLengthM);
    // Перерасчет результатов (или обозначение его необходимости) с перерисовкой подписей сущностей
    // или переипользование инструмента в случае смены рельефа (активного или его отсутствия)
    effect(() => {
      try {
        const currentTerrainName = this._nowTerrainName();
        untracked(async () => {
          // При любом изменении в процессе построения
          if (this.isActive() === true || this._measureHasStarted() === true) {
            this.toggleDrawing(); // отмена текущего сценария
            this.toggleDrawing(); // немедленный запуск нового
            if (currentTerrainName === undefined) {
              this._mostDetailed.set(false);
            }
            return;
            // При наличии результата выполнения сценария работы инструмента
          } else {
            // Notice: в отсутствие рельефа чекбокс блокируется в методе this.checkMostDetailedToggling (для this.checkboxHandler)
            // При отключении рельефа происходит только перерисовка подписей сущностей на холсте (без учета расчетов по рельефу)
            if (currentTerrainName === undefined) {
              this._mostDetailed.set(false);
              if (this.validPickedEnttity()) {
                await this.setNewEntityLabelsText(this.validPickedEnttity(), false);
              }
            } else {
              // Затребование перерасчета при последующей активации чекбокса (когда он отключен)
              if (this._mostDetailed() === false) {
                this._recalculationFlag.set(true);
                return;
              }
              // Немедленный перерасчет с учетом рельефа (при включенном чекбоксе)
              if (this._mostDetailed() === true) {
                this._recalculationFlag.set(true);
                await this.setDistanceWithTerrain(this.validPickedEnttity());
                await this.setNewEntityLabelsText(this.validPickedEnttity(), true);
                return;
              }
            }
          }
        });
      } catch (error: unknown) {
        reportError(error);
      }
    });
    // ------------------ Блок логики поведения инструмента при смене рельефа (end) ------------------- //

    // ------------------ Блок логики автоматической деактивации инструмента (start) ------------------ //
    effect(() => {
      try {
        if (this.hasErasedAll() === true) {
          untracked(() => {
            if (this.isActive() === true || this._measureHasStarted() === true) {
              this.cancelThisTool();
            }
            this.nullAllToolSettigs();
          });
        }
      } catch (error: unknown) {
        reportError(error);
      }
    });
  }
  private readonly linesGroupsCounter = computed<number>(
    () => this.linearMeasurementsLinesList().length,
  );
  // Еще используется в calculate-line-floating-window.service.ts
  public readonly hasErasedAll = linkedSignal<number, boolean>({
    source: this.linesGroupsCounter,
    computation(newVal, prevVal) {
      return prevVal && !newVal ? true : false;
    },
  });
  // Еще используется в calculate-line.ts
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
  // ------------------- Блок логики автоматической деактивации инструмента (end) --------------------- //

  // --------------------- Блок для хранения основных состояний сервиса (start) ----------------------- //
  // Еще используется в effect calculate-line-floating-window.service (при удалении сущностей инструмента)
  public nullAllToolSettigs(): boolean {
    try {
      this._validPickedEnttity.set(undefined);
      this.nullAllToolTerrainSettigs();
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  // -------------------------------------------- //
  // Еще используется в calculate-line-floating-window.service.ts
  public readonly linearMeasurementsLinesList = computed(() =>
    this.$measureService.linearMeasurementsLinesList(),
  );
  // Еще используется в calculate-line.ts (для деактивации кнопки инструмента на правой панели приложения)
  public readonly measuresBlocker = computed(() => this.$toolsService.drawingsBlocker());
  private _isActive = signal<boolean>(false);
  // Еще используется в calculate-line.ts и calculate-line-floating-window.service.ts
  get isActive() {
    return this._isActive;
  }
  private _measureHasStarted = signal<boolean>(false);
  get measureHasStarted() {
    return this._measureHasStarted;
  }

  // Отлов сущности, соответствующей данному плавающему окну, для отображения в нем (исключение вспомогательных сущностей в группе)
  private newPickedEntity = computed<Cesium.Entity | undefined>(() => {
    const selectedEntity = this.$viewerService.viewer?.newPickedEntity?.();
    let targetEntity: Cesium.Entity | undefined = undefined;
    untracked(() => {
      if (selectedEntity?.toolName !== this.toolName) return;
      if (!this.linearMeasurementsLinesList().length) return;
      const indexGroup = this.linearMeasurementsLinesList().findIndex((group) =>
        !!group && selectedEntity.id.startsWith(group.groupId),
      );
      if (indexGroup === -1) return;
      const group = this.linearMeasurementsLinesList()[indexGroup];
      if (group?.defaultEntity) {
        targetEntity = group.defaultEntity;
      } else {
        if (!group?.entitiesList.length) return;
        const indexEntity = group?.entitiesList.findIndex(
          (entity) => !!entity && !entity.id.includes('auxiliary'), // "не вспомогательная" === "основная"
        );
        if (indexEntity === -1) return;
        targetEntity = group.entitiesList[indexEntity];
      }
    });
    return targetEntity;
  });
  // Еще используется в calculate-line-floating-window.html
  private _validPickedEnttity = linkedSignal<Cesium.Entity | undefined, Cesium.Entity | undefined>({
    source: this.newPickedEntity,
    computation(newVal, prevVal) {
      return newVal !== undefined ? newVal : prevVal?.value;
    },
  });
  // Еще используется в calculate-line-floating-window.html
  get validPickedEnttity() {
    return this._validPickedEnttity;
  }
  // --------------------- Блок для хранения основных состояний сервиса (end) ------------------------- //

  // --------------------------- Блок отработки кнопки инструмента (start) ---------------------------- //
  // Еще используется в calculate-line-floating-window.service.ts
  public readonly toolName: MeasuringToolName = 'calculateLine';
  // Используется в calculate-line.ts
  public buttonHandler(event: MouseEvent): void {
    // event.stopPropagation(); // не применять! (событие также ловится в родителе (measuring-tools.ts))
    if (event.button === 0) {
      this.toggleDrawing();
    } else if (event.button === 1) {
      if (this._measureHasStarted() === false) {
        this.$measureService.allToolEntitiesCleaning(this.toolName); // cancelThisTool() сработает по эффекту
      } else {
        this.$measureService.removeTemporalEntities();
        if (this.linesGroupsCounter()) {
          this.$measureService.allToolEntitiesCleaning(this.toolName);
        } else this.cancelThisTool();
      }
    }
  }
  private toggleDrawing(): void {
    try {
      if (this.isActive() === false && !this.measuresBlocker()) {
        if (this.$measureService.isLines() === true) {
          // Отработает effect с cancelThisTool() в сервисе плавающего окна
          this.$measureService.allToolEntitiesCleaning(this.toolName);
          // Ждем его и перезапускаем
          setTimeout(this.toggleDrawing.bind(this), 100);
          return;
        }
        this.isActive.set(true);
        this.drawLineMeasureGraphics({
          toolName: this.toolName,
          name: getRusMeasuringToolName(this.toolName),
          clampToGround: true,
          mostDetailed: this._mostDetailed(),
          distanceSegmentLengthM: this.distanceSegmentLengthM(),
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
  // --------------------------- Блок отработки кнопки инструмента (end) ------------------------------ //

  // ------ Main-функция для работы с холстом - сценарий построения и первичных расчетов (start) ------ //
  private drawLineMeasureGraphics(options: MeasureOptions = {}): boolean {
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
      const optForPoint: MeasureOptions = cloneDeep(options);
      // Начало id должно быть общим для суммы сущностей одного сценария работы инструмента
      optForPoint.id = `${groupIdChunk}-${this.toolName}-point-${Math.ceil(Math.random() * 1000000)}`;
      const optForLine: MeasureOptions = cloneDeep(options);
      optForLine.id = `${groupIdChunk}-${this.toolName}-line-${Math.ceil(Math.random() * 1000000)}`;
      if (options?.mostDetailed) {
        optForLine.id = `${groupIdChunk}-${this.toolName}-line-mostDetailed-${options?.distanceSegmentLengthM || this.$viewerService.distanceSegmentLengthM}-${Math.ceil(Math.random() * 1000000)}`;
      }
      if (options?.name) optForPoint.name = options.name + ' ' + '(auxiliary)' + ' ' + groupIdChunk;
      // if (options?.name) optForLine.name = options.name + ' ' + groupIdChunk;
      if (options?.name) optForLine.name = options.name; // при завершении сценария прибавится дистанция
      if (optForLine?.label) {
        optForLine.label.pixelOffset = new Cesium.Cartesian2(-20, -40);
      } else {
        optForLine.label = { pixelOffset: new Cesium.Cartesian2(-20, -40) };
      }

      let lineEntity: Cesium.Entity | undefined = undefined;

      // "Сигналы" для колбэков ниже
      let polylinePositions: Array<Cesium.Cartesian3> = [];
      let labelPosition: Cesium.Cartesian3 = Cesium.Cartesian3.ZERO;
      let labelText: string = '';
      // Служит для возможности расчета $viewerService.calculatePosDistances() только по последнему отрезку (а не каждый раз по всему массиву точек полилинии)
      // Возрастает по ЛКМ, ПКМ при детальном расчете дистанции.
      let distanceChunks: number = 0;
      let fullDistanceWithoutTerrain: number = 0;
      const cachedPointsData: Array<{
        position: Cesium.Cartesian3;
        distance: number;
        distanceText: string;
      }> = [];

      // Должны быть в видимости создания lineEntity (привязаны ссылочным способом)
      const reactiveLabelPosition: Cesium.CallbackPositionProperty =
        new Cesium.CallbackPositionProperty(() => labelPosition, false);
      const reactiveLabelText: Cesium.CallbackProperty = new Cesium.CallbackProperty(
        () => labelText,
        false,
      );
      const reactivePolylinePositions: Cesium.CallbackProperty = new Cesium.CallbackProperty(
        () => polylinePositions,
        false,
      );

      this.$toolsService.createNewCommonHandler(this.toolName);

      // ЛКМ (создание линии отрезков, нанесение точек ее излома)
      const startMeasure = async (movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        try {
          this._measureHasStarted.set(true);
          this.$viewerService.onEntityPickingBlock();

          // Удаление на время отслеживания mousemove пока идет детальный расчет дистанции по рельефу (при options.mostDetailed)
          if (options?.mostDetailed && !this.$toolsService.isMobile) {
            if (
              this.$toolsService
                .commonHandler()
                ?.getInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
            ) {
              this.$toolsService.removeActionFromCommonHandler(
                Cesium.ScreenSpaceEventType.MOUSE_MOVE,
              );
            }
          }

          let mouseEntity: Cesium.Entity | undefined = undefined;
          let nowPos: Cesium.Cartesian3 | undefined = undefined;
          if (this.$toolsService.isMobile && movement?.position instanceof Cesium.Cartesian2) {
            const touchPosition: Cesium.Cartesian2 = movement.position;
            if (touchPosition.x && touchPosition.y) {
              nowPos = this.$viewerService?.viewer?.scene?.pickPosition(touchPosition);
              if (nowPos && nowPos instanceof Cesium.Cartesian3) {
                nowPos = await this.$toolsService.getDetailedPosition(nowPos);
              }
            }
          } else {
            mouseEntity = await this.$toolsService.getMouseEntity(true);
            nowPos = cartesianFromProperty(mouseEntity?.position?.getValue());
          }
          if (nowPos === undefined) {
            // throw new Error('Position arg is undefined in drawLineMeasureGraphics()');
            this.cancelThisTool();
            return;
          }

          if (optForPoint?.id) {
            const newIdArr: string[] = optForPoint.id.split('-');
            // Точки будут отличаться окончанием id
            newIdArr[newIdArr.length - 1] = `${Math.ceil(Math.random() * 1000000)}`;
            optForPoint.id = newIdArr.join('-');
          }
          optForPoint.label = {
            ...{
              text: '',
              show: true,
              showBackground: true,
              font: options?.font || '14px monospace',
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
          };
          const pointEntity: Cesium.Entity | undefined = this.$toolsService.setPointEntity(
            nowPos,
            optForPoint,
          );
          if (pointEntity === undefined) return;
          if (
            this.$measureService
              .temporalEntitiesList()
              .findIndex((item) => item?.id === pointEntity?.id) !== -1
          ) {
            throw new Error('Entity already exists in temporal store by setPointEntity()');
          }

          if (polylinePositions.length === 0) {
            polylinePositions.push(nowPos);
            cachedPointsData.push({
              position: polylinePositions[polylinePositions.length - 1],
              distance: distanceChunks,
              distanceText: Humanify.distanceM(distanceChunks),
            });
            // Первая точка - нулевая, детальный расчет не нужен
            if (pointEntity?.label) {
              // pointEntity.label.text = new Cesium.ConstantProperty(Humanify.distanceM(0));
              pointEntity.label.text = new Cesium.ConstantProperty('Старт');
            }
            if (options?.mostDetailed) {
              labelText = '...ожидание точки';
            }
            // Последующие точки
          } else {
            if (Cesium.Cartesian3.equals(nowPos, polylinePositions[polylinePositions.length - 1])) {
              console.info('Next & start positions are equal');
              return;
            }
            if (!this.$toolsService.isMobile) {
              polylinePositions.pop(); // удаление позиции из mousemove-события
            }
            polylinePositions.push(nowPos); // добавление позиции из клика

            if (options?.mostDetailed) {
              // расчет по частям (кэш + новый отрезок)
              labelText = '...детальный расчет';
              if (pointEntity?.label) {
                // Notice: дубликат для стирания в первом mousemove-событии не должен попасть в текущий расчет
                const chunkMeasurement = await this.$viewerService.calculatePosDistances(
                  polylinePositions.slice(polylinePositions.length - 2),
                  true,
                  options?.distanceSegmentLengthM,
                  false,
                );
                if (typeof chunkMeasurement === 'number') {
                  distanceChunks += chunkMeasurement;
                  const nowLabelText = Humanify.distanceM(distanceChunks);
                  cachedPointsData.push({
                    position: polylinePositions[polylinePositions.length - 1],
                    distance: distanceChunks,
                    distanceText: nowLabelText,
                  });
                  pointEntity.label.text = new Cesium.ConstantProperty(nowLabelText);
                } else {
                  console.info('distanceChunks increasing failed');
                }
              }
              labelText = '...ожидание точки';
            } else {
              if (!this.$toolsService.isMobile) {
                // Берется из mousemove
                if (labelText && pointEntity.label) {
                  pointEntity.label.text = new Cesium.ConstantProperty(labelText);
                }
              } else {
                // Заместо mousemove
                const fullDistanceCalculation = await this.$viewerService.calculatePosDistances(
                  polylinePositions,
                  false,
                  undefined,
                  false,
                );
                if (typeof fullDistanceCalculation === 'number' && pointEntity.label) {
                  fullDistanceWithoutTerrain = fullDistanceCalculation;
                  labelText = Humanify.distanceM(fullDistanceWithoutTerrain);
                  pointEntity.label.text = new Cesium.ConstantProperty(labelText);
                } else {
                  labelText = fullDistanceCalculation + '';
                  if (pointEntity.label)
                    pointEntity.label.text = new Cesium.ConstantProperty(labelText);
                }
              }
              // В любом случае добавляем в кэш
              cachedPointsData.push({
                position: polylinePositions[polylinePositions.length - 1],
                distance: fullDistanceWithoutTerrain, // уже рассчитано при mousemove
                distanceText: labelText, // уже рассчитано при mousemove
              });
            }
          }

          this.$measureService.addNewEntityToMeasureLayer(pointEntity);
          this.$measureService.temporalEntitiesList.update((arr) => [...arr, pointEntity]);

          labelPosition = polylinePositions[polylinePositions.length - 1];

          if (lineEntity === undefined) {
            lineEntity = this.$toolsService.setLineEntity(
              polylinePositions,
              labelPosition,
              labelText,
              optForLine,
            );
            if (lineEntity) {
              if (
                this.$measureService
                  .temporalEntitiesList()
                  .findIndex((item) => item?.id === lineEntity?.id) !== -1
              ) {
                throw new Error('Entity already exists in temporal store by setLineEntity()');
              }
              if (lineEntity.position) lineEntity.position = reactiveLabelPosition;
              if (lineEntity.label?.text) lineEntity.label.text = reactiveLabelText;
              if (lineEntity.polyline?.positions)
                lineEntity.polyline.positions = reactivePolylinePositions;

              this.$measureService.addNewEntityToMeasureLayer(lineEntity);
              this.$measureService.temporalEntitiesList.update((arr) => [...arr, lineEntity]);
            }
          }
          if (!this.$toolsService.isMobile) {
            // Notice: добавлять в самом конце колбэка
            polylinePositions.push(nowPos.clone()); // дубликат для стирания в первом mousemove-событии
          }

          if (options?.mostDetailed && !this.$toolsService.isMobile) {
            this.$toolsService.setCommonHandler(
              continueMeasure,
              Cesium.ScreenSpaceEventType.MOUSE_MOVE,
            );
          }
        } catch (error: unknown) {
          this.cancelThisTool();
          reportError(error);
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      this.$toolsService.setCommonHandler(startMeasure, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // Перемещение курсора (изменение последней точки полилинии)
      const continueMeasure = async () => {
        try {
          if (polylinePositions.length < 2) return;
          if (!this.$toolsService.isMobile) {
            const mouseEntity: Cesium.Entity = await this.$toolsService.getMouseEntity(false); // без точного рельефа!
            const movePos = cartesianFromProperty(mouseEntity?.position?.getValue());
            if (movePos === undefined) return;
            polylinePositions.pop(); // стирание предыдущей позиции из mousemove ИЛИ "заглушки" из предшествующих кликов
            polylinePositions.push(movePos); // добавление актуальной позиции по mousemove
            // При детальном расчете - нерационально (в подписи остается заглушка, оставшаяся после клика)
            if (!options?.mostDetailed) {
              // Задействован весь массив polylinePositions (distanceChunks не участвует)
              const fullDistanceCalculation = await this.$viewerService.calculatePosDistances(
                polylinePositions,
                false,
                undefined,
                false,
              );
              if (typeof fullDistanceCalculation === 'number') {
                fullDistanceWithoutTerrain = fullDistanceCalculation;
                labelText = Humanify.distanceM(fullDistanceWithoutTerrain);
              } else {
                labelText = fullDistanceCalculation;
              }
            }
            labelPosition = movePos;
          }
        } catch (error: unknown) {
          this.cancelThisTool();
          reportError(error);
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      // При else добавление/удаление контролируется соседними хэндлерами
      if (!options?.mostDetailed && !this.$toolsService.isMobile) {
        this.$toolsService.setCommonHandler(
          continueMeasure,
          Cesium.ScreenSpaceEventType.MOUSE_MOVE,
        );
      }

      // ПКМ (нанесение последней точки, сокрытие описания полилинии, сценарий закрытия инструмента)
      const finishMeasure = async (_movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        try {
          if (this._measureHasStarted() === false) {
            this.cancelThisTool();
            return;
          }

          if (polylinePositions.length >= 2) {
            if (
              Cesium.Cartesian3.equals(
                polylinePositions[0],
                polylinePositions[polylinePositions.length - 1],
              )
            ) {
              console.info('End & start positions are equal');
              this.cancelThisTool();
              return;
            }
            this.$viewerService.offEntityPickingBlock();
            this.$toolsService.clearCommonHandler();

            if (!this.$toolsService.isMobile) {
              // const mouseEntity: Cesium.Entity = await this.$toolsService.getMouseEntity();
              // const endPos: Cesium.Cartesian3 | undefined = mouseEntity?.position?.getValue();
              // if (endPos === undefined) {
              //   // throw new Error('Position arg is undefined in drawLineMeasureGraphics()');
              //   this.cancelThisTool();
              //   return;
              // }
              // if (Cesium.Cartesian3.equals(polylinePositions[0], endPos)) {
              //   console.info('End & start positions are equal');
              //   this.cancelThisTool();
              //   return;
              // }
              // polylinePositions.pop(); // удаление позиции из mousemove-события
              // polylinePositions.push(endPos); // добавление позиции из клика

              if (options?.mostDetailed) {
                labelText = '...детальный расчет';
                const chunkMeasurement = await this.$viewerService.calculatePosDistances(
                  polylinePositions.slice(polylinePositions.length - 2),
                  true,
                  options?.distanceSegmentLengthM,
                  false,
                );
                if (typeof chunkMeasurement === 'number') {
                  distanceChunks += chunkMeasurement;
                  const nowLabelText = Humanify.distanceM(distanceChunks);
                  cachedPointsData.push({
                    position: polylinePositions[polylinePositions.length - 1],
                    distance: distanceChunks,
                    distanceText: nowLabelText,
                  });
                  labelText = nowLabelText;
                  this._distanceWithTerrain.set(distanceChunks);
                } else {
                  throw new Error(
                    'distanceChunks increasing failed, distanceWithTerrain has not been calculated',
                  );
                }
                // Расчет для отображения в плавающем окне инструмента (без привязки к подписям сущностей), плюс, для кэша
                // Задействован весь массив polylinePositions (distanceChunks не участвует)
                const fullDistanceCalculation = await this.$viewerService.calculatePosDistances(
                  polylinePositions,
                  false,
                  undefined,
                  false,
                ); // "экспресс"-расчет без учета шага измерения дистанции (незатратно)
                if (typeof fullDistanceCalculation === 'number') {
                  fullDistanceWithoutTerrain = fullDistanceCalculation;
                  this._distanceWithoutTerrain.set(fullDistanceCalculation);
                } else {
                  throw new Error('distanceWithoutTerrain has not been calculated');
                }
              } else {
                const fullDistanceCalculation = await this.$viewerService.calculatePosDistances(
                  polylinePositions,
                  false,
                  undefined,
                  false,
                );
                if (typeof fullDistanceCalculation === 'number') {
                  fullDistanceWithoutTerrain = fullDistanceCalculation;
                  const nowLabelText = Humanify.distanceM(fullDistanceCalculation);
                  cachedPointsData.push({
                    position: polylinePositions[polylinePositions.length - 1],
                    distance: fullDistanceCalculation,
                    distanceText: nowLabelText,
                  });
                  labelText = nowLabelText;
                  this._distanceWithoutTerrain.set(fullDistanceCalculation);
                } else {
                  labelText = fullDistanceCalculation;
                  throw new Error('distanceWithoutTerrain has not been calculated');
                }
              }
            } else {
              // Результат из последнего тапа
              this._distanceWithoutTerrain.set(fullDistanceWithoutTerrain);
            }

            if (lineEntity?.label) {
              if (options?.name && lineEntity.name) {
                lineEntity.name = `${lineEntity.name} ${labelText}`;
              }
              // Финальная подпись группы сущностей (чуть больше размером) остается у последней точки, а не у линии
              lineEntity.label.show = new Cesium.ConstantProperty(false);
            }

            if (!this.$toolsService.isMobile) {
              if (optForPoint.label) {
                optForPoint.label.text = labelText;
                // optForPoint.label.font = '20px sans-serif';
                optForPoint.label.backgroundColor = undefined;
              }
              if (optForPoint?.id) {
                const newIdArr: string[] = optForPoint.id.split('-');
                newIdArr[newIdArr.length - 1] = `${Math.ceil(Math.random() * 1000000)}`;
                optForPoint.id = newIdArr.join('-');
              }
              const lastPointEntity: Cesium.Entity | undefined = this.$toolsService.setPointEntity(
                polylinePositions[polylinePositions.length - 1], // д/б endPos
                optForPoint,
              );
              if (lastPointEntity === undefined) return;
              if (
                this.$measureService
                  .temporalEntitiesList()
                  .findIndex((item) => item?.id === lastPointEntity?.id) !== -1
              ) {
                throw new Error('Entity already exists in temporal store by setPointEntity()');
              }

              this.$measureService.addNewEntityToMeasureLayer(lastPointEntity);
              this.$measureService.temporalEntitiesList.update((arr) => [...arr, lastPointEntity]);
            }

            let pointsQuantity: number = 0;
            for (const entity of this.$measureService.temporalEntitiesList()) {
              if (entity?.id.includes('point')) {
                pointsQuantity++;
              }
            }
            if (pointsQuantity !== polylinePositions.length) {
              console.info(
                'WARNING:',
                `pointsQuantity (${pointsQuantity}) !== polylinePositions.length (${polylinePositions.length})`,
              );
            }

            this.$measureService.pushGroupFromTemporal(groupIdChunk, options?.toolName, lineEntity);
            this.$measureService.clearTemporalEntitiesList(groupIdChunk);
            this.$viewerService.setNewPickedEntity(lineEntity);

            if (options?.mostDetailed) {
              const newCacheKey: CalculationsCacheKey = {
                validEntityId: lineEntity?.id,
                terrainName: this._nowTerrainName(),
                distanceSegmentLengthM: this.distanceSegmentLengthM(),
                distanceWithoutTerrain: fullDistanceWithoutTerrain,
              };
              const newCacheValue: CalculationsCacheValue = {
                distanceWithTerrain: distanceChunks,
                distanceWithoutTerrain: fullDistanceWithoutTerrain,
                points: cachedPointsData,
              };
              this.pushCalculationsCache(newCacheKey, newCacheValue);
              // console.log(this.getCalculationsFromCache(newCacheKey));
            } else {
              const newCacheKey: CalculationsCacheKey = {
                validEntityId: lineEntity?.id,
                terrainName: undefined,
                distanceSegmentLengthM: undefined,
                distanceWithoutTerrain: fullDistanceWithoutTerrain,
              };
              const newCacheValue: CalculationsCacheValue = {
                distanceWithTerrain: undefined,
                distanceWithoutTerrain: fullDistanceWithoutTerrain,
                points: cachedPointsData,
              };
              this.pushCalculationsCache(newCacheKey, newCacheValue);
              // console.log(this.getCalculationsFromCache(newCacheKey));
            }
          }

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
  // ------ Main-функция для работы с холстом - сценарий построения и первичных расчетов (end) -------- //

  // --------------------- Блок для перерасчетов дистанции по рельефу (start) ------------------------- //
  // Используется в местном методе nullAllToolSettigs
  public nullAllToolTerrainSettigs(): boolean {
    try {
      this._distanceWithoutTerrain.set(0);
      this._distanceWithTerrain.set(0);
      this._recalculationFlag.set(false);
      this._calculationsCache.clear();
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  // -------------------------------------------- //
  // Флаг для детального расчета дистанции по активному рельефу
  // Также изменяется в местном effect (при отключении рельефа)
  private _mostDetailed = signal<boolean>(false);
  // Еще используются в calculate-line-floating-window.html
  get mostDetailed() {
    return this._mostDetailed;
  }

  // Используются в calculate-line-floating-window.html
  public async checkboxHandler(event: MatCheckboxChange): Promise<boolean> {
    try {
      const mostDetailedTogglingOk: boolean = this.checkMostDetailedToggling(event);
      if (this.validPickedEnttity() && mostDetailedTogglingOk) {
        await this.setDistanceWithTerrain(this.validPickedEnttity()); // не отработает при false-флаге (this._recalculationFlag())
        await this.setNewEntityLabelsText(this.validPickedEnttity(), this.mostDetailed());
      }
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  private checkMostDetailedToggling(event: MatCheckboxChange): boolean {
    try {
      if (!this.$viewerService?.viewer?.terrainProvider.availability) {
        alert('Отсутствует рельеф для детального расчета');
        this._mostDetailed.set(false); // notice: не убирать
        event.source.checked = false;
        if (this.isActive() === true || this._measureHasStarted() === true) {
          this.toggleDrawing(); // отмена текущего сценария
          this.toggleDrawing(); // немедленный запуск нового
        }
        return false;
      } else {
        if (this.isActive() === true || this._measureHasStarted() === true) {
          this.toggleDrawing();
          this.toggleDrawing();
        }
        return true;
      }
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  // Используются в calculate-line-floating-window.html
  public async segmentLengthInputHandler(event: Event): Promise<boolean> {
    try {
      this.setDistanceSegmentLengthM(event);
      this._recalculationFlag.set(true);
      if (this.validPickedEnttity()) {
        await this.setDistanceWithTerrain(this.validPickedEnttity(), event); // не отработает при false-флаге (this._recalculationFlag())
        await this.setNewEntityLabelsText(this.validPickedEnttity(), true);
      }
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  // -------------------------------------------- //

  private _nowTerrainName = computed<string | undefined>(() => this.$toolsService.nowTerrainName());
  // Используется в calculate-line-floating-window.html
  get nowTerrainName() {
    return this._nowTerrainName;
  }

  // -------------------------------------------- //

  // При переключении чекбокса высоты перерасчет не нужен при условии наличия желаемого результата в сигнале this._distanceWithTerrain()
  // Устанавливается на true при:
  // - срабатывании эффекта сервиса плавающего окна (первоначальная необходимость в последующем перерасчете для его новой сущности);
  // - сдвиге точки сущности
  // - смене шага измерений по рельефу,
  // - смене terrain-провайдера,
  // При этом видимость полей с информацией о рельефе контролируется this.$calculateLineService.mostDetailed()
  private _recalculationFlag = signal<boolean>(false);
  get recalculationFlag() {
    return this._recalculationFlag;
  }
  // Используется в effect calculate-line-floating-window.service (при наличии у вновь построенной сущности чанка id === '-most-detailed-')
  // и инпуте шага calculate-line-floating-window.html (onchange-событие)
  public setRecalculationFlag(newVal: boolean): void {
    this._recalculationFlag.set(newVal);
  }

  // -------------------------------------------- //

  // Флаг для заглушки ожидания расчетов и блокировки инпутов
  private _waitingForCalculations = signal<boolean>(false);
  // Еще используется в calculate-line-floating-window.html
  get waitingForCalculations() {
    return this._waitingForCalculations;
  }

  // -------------------------------------------- //

  public readonly distanceSegmentLengthM = signal<number>(100);
  // Еще используется в calculate-line-floating-window.html
  public setDistanceSegmentLengthM(event: Event): boolean {
    try {
      const newSegment = this.validateDistanceSegmentLengthM(event);
      if (newSegment) {
        this.distanceSegmentLengthM.set(newSegment);
        if (this._mostDetailed() === true) {
          if (this.isActive() === true || this._measureHasStarted() === true) {
            this.toggleDrawing();
            this.toggleDrawing();
          }
        }
        return true;
      } else return false;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }
  private validateDistanceSegmentLengthM(event: Event): number {
    try {
      if (event.target instanceof HTMLInputElement) {
        const parsed = Number(event.target.value);
        if (!Number.isFinite(parsed)) {
          event.target.value = `${this.$viewerService.distanceSegmentLengthM}`;
          return this.$viewerService.distanceSegmentLengthM;
        }
        const newVal = Math.abs(parsed);
        if (newVal < 1) {
          event.target.value = `${this.$viewerService.distanceSegmentLengthM}`;
          return this.$viewerService.distanceSegmentLengthM;
        } else if (newVal > 40000000) {
          event.target.value = '40000000'; // длина экватора
          return 40000000;
        } else {
          return newVal;
        }
      } else {
        console.info('Invalid event.target in validateDistanceSegmentLengthM fn');
        return this.$viewerService.distanceSegmentLengthM;
      }
    } catch (error: unknown) {
      reportError(error);
      return this.$viewerService.distanceSegmentLengthM;
    }
  }

  // -------------------------------------------- //

  private _calculationsCache = new Map<string, CalculationsCacheValue | undefined>();
  private getCalculationsFromCache(
    newCacheKey: CalculationsCacheKey,
  ): CalculationsCacheValue | undefined {
    try {
      const newSerializedCacheKey = JSON.stringify(newCacheKey, (_key, value) => {
        return value === undefined ? null : value; // обход конфликта undefined в JSON-объектах
      });
      return this._calculationsCache.get(newSerializedCacheKey);
    } catch (error: unknown) {
      reportError(error);
      return undefined;
    }
  }
  private pushCalculationsCache(
    newCacheKey: CalculationsCacheKey,
    newCacheValue: CalculationsCacheValue,
  ): boolean {
    try {
      const newSerializedCacheKey = JSON.stringify(newCacheKey, (_key, value) => {
        return value === undefined ? null : value;
      });
      this._calculationsCache.set(newSerializedCacheKey, newCacheValue);
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  // -------------------------------------------- //

  // Первое значение получает в main-функции drawLineMeasureGraphics. Последующие - после перерасчета.
  private _distanceWithTerrain = signal<number>(0);
  get distanceWithTerrain() {
    return this._distanceWithTerrain;
  }
  // Используется в хэндлерах для инпутов calculate-line-floating-window.html и местном effect.
  // Отработает только в случае необходимости перерасчета при:
  // - сдвиге точки сущности.
  // - onchange-событии чекбокса расчета по рельефу,
  // - смене шага измерений по рельефу,
  // - смене terrain-провайдера,
  public async setDistanceWithTerrain(
    validPickedEnttity: Cesium.Entity | undefined,
    event?: Event,
    byPointMove?: boolean,
  ): Promise<boolean> {
    try {
      if (
        !this._recalculationFlag() ||
        this.isActive() === true ||
        this._measureHasStarted() === true ||
        validPickedEnttity === undefined ||
        !(validPickedEnttity instanceof Cesium.Entity) ||
        this._mostDetailed() !== true ||
        !!this.distanceSegmentLengthM() !== true
      ) {
        return false;
      }
      // ------------------------------- //
      if (byPointMove === true) {
        this._calculationsCache.clear();
        this.setDistanceWithoutTerrain(validPickedEnttity);
      }
      // ------------------------------- //
      let newSegment;
      // event - только для числового инпута
      if (event && event.target instanceof HTMLInputElement) {
        newSegment = this.validateDistanceSegmentLengthM(event);
      }
      // ------------------------------- //
      this._waitingForCalculations.set(true);
      const newCacheKey: CalculationsCacheKey = {
        validEntityId: validPickedEnttity?.id,
        terrainName: this._nowTerrainName(),
        distanceSegmentLengthM: newSegment || this.distanceSegmentLengthM(),
        distanceWithoutTerrain: this.distanceWithoutTerrain(),
      };
      if (!byPointMove) {
        const calculationsCacheValue: CalculationsCacheValue | undefined =
          this.getCalculationsFromCache(newCacheKey);
        if (calculationsCacheValue !== undefined) {
          if (typeof calculationsCacheValue.distanceWithTerrain === 'number') {
            this._distanceWithTerrain.set(calculationsCacheValue.distanceWithTerrain);
            this._recalculationFlag.set(false);
            console.info(
              'Distance with terrain result has taken from cache (by setDistanceWithTerrain fn)',
            );
            return true;
          } else {
            console.info(
              'Invalid distance with terrain result in cache (by setDistanceWithTerrain fn)',
            );
          }
        }
      }
      // ------------------------------- //
      const polylinePositions = cartesian3ListFromProperty(
        validPickedEnttity?.polyline?.positions?.getValue(),
      );
      if (
        polylinePositions?.length &&
        polylinePositions.length > 1 &&
        polylinePositions[1] instanceof Cesium.Cartesian3
      ) {
        const cachedPointsData: Array<{
          position: Cesium.Cartesian3;
          distance: number;
          distanceText: string;
        }> = [];
        let distance: number = 0;
        cachedPointsData.push({
          position: polylinePositions[0],
          distance: distance,
          distanceText: Humanify.distanceM(distance),
        });
        // Notice: первая точка всегда 0, последняя - общая протяженность
        for (let i = 1; i <= polylinePositions.length - 1; i++) {
          const prevPos = polylinePositions[i - 1];
          const nowPos = polylinePositions[i];
          const distanceChunk = await this.$viewerService.calculatePosDistances(
            [prevPos, nowPos],
            true,
            newSegment || this.distanceSegmentLengthM(),
            false,
          );
          if (typeof distanceChunk === 'number') {
            distance += distanceChunk;
            const distanceChunkText = Humanify.distanceM(distance);
            cachedPointsData.push({
              position: nowPos,
              distance: distance,
              distanceText: distanceChunkText,
            });
            if (i === polylinePositions.length - 1) {
              const calculationsCacheValue: CalculationsCacheValue = {
                distanceWithTerrain: distance,
                distanceWithoutTerrain: newCacheKey.distanceWithoutTerrain,
                points: cachedPointsData,
              };
              // Notice: ключ кэша не изменяется, т.к. значения его идентификационных параметров не изменялись
              this.pushCalculationsCache(newCacheKey, calculationsCacheValue);
              this._distanceWithTerrain.set(distance);
              this._recalculationFlag.set(false);
              // console.log(this.getCalculationsFromCache(newCacheKey));
            }
          } else {
            throw new Error('Invalid distanceChunk result in setDistanceWithTerrain fn');
          }
        }
        return true;

        // Deprecated (без кэширования данных для точек)
        // const withHumanify = false;
        // const calculation: string | number = await this.$viewerService.calculatePosDistances(
        //   polylinePositions,
        //   true,
        //   newSegment || this.distanceSegmentLengthM(),
        //   withHumanify,
        // );
        // console.info('distance recalculation (by setDistanceWithTerrain fn)');
        // if (typeof calculation === 'number') {
        //   this._distanceWithTerrain.set(calculation);
        //   const calculationsCacheValue: CalculationsCacheValue = {
        //     distanceWithTerrain: calculation,
        //     distanceWithoutTerrain: newCacheKey.distanceWithoutTerrain,
        //     polylinePositions: polylinePositions,
        //   };
        //   this.pushCalculationsCache(newCacheKey, calculationsCacheValue);
        //   this._recalculationFlag.set(false);
        //   return true;
        // } else {
        //   console.log(
        //     ('Invalid distance calculation result in setDistanceWithTerrain fn'),
        //   );
        //   return false;
        // }
      } else {
        throw new Error('Invalid polylinePositions array in setDistanceWithTerrain fn');
      }
    } catch (error: unknown) {
      reportError(error);
      this.mostDetailed.set(false);
      return false;
    } finally {
      this._waitingForCalculations.set(false);
    }
  }

  private _distanceWithTerrainDescription = computed<string>(() => {
    try {
      const distanceWithTerrain = this._distanceWithTerrain();
      let distanceWithTerrainText: string;
      if (!distanceWithTerrain) {
        distanceWithTerrainText = '';
      } else {
        distanceWithTerrainText = Humanify.distanceM(distanceWithTerrain);
      }
      return distanceWithTerrainText;
    } catch (error: unknown) {
      reportError(error);
      return '';
    }
  });
  // Используется в calculate-line-floating-window.html
  get distanceWithTerrainDescription() {
    return this._distanceWithTerrainDescription;
  }

  // -------------------------------------------- //

  // Первое значение получает в main-функции "drawLineMeasureGraphics". Последующие - после перерасчета.
  private _distanceWithoutTerrain = signal<number>(0);
  get distanceWithoutTerrain() {
    return this._distanceWithoutTerrain;
  }
  // Отработает только в случае необходимости перерасчета при сдвиге точки сущности.
  private async setDistanceWithoutTerrain(
    validPickedEnttity: Cesium.Entity | undefined,
    byPointMove?: boolean,
  ): Promise<boolean> {
    try {
      if (
        this.isActive() === true ||
        this.measureHasStarted() === true ||
        validPickedEnttity === undefined ||
        !(validPickedEnttity instanceof Cesium.Entity)
      ) {
        return false;
      }
      if (byPointMove === true) {
        this._calculationsCache.clear();
      }
      const newCacheKey: CalculationsCacheKey = {
        validEntityId: validPickedEnttity?.id,
        terrainName: undefined,
        distanceSegmentLengthM: undefined,
        distanceWithoutTerrain: this.distanceWithoutTerrain(), // будет изменен по результату пересчета
      };
      if (!byPointMove) {
        const calculationsCacheValue: CalculationsCacheValue | undefined =
          this.getCalculationsFromCache(newCacheKey);
        if (calculationsCacheValue !== undefined) {
          if (typeof calculationsCacheValue.distanceWithoutTerrain === 'number') {
            this._distanceWithoutTerrain.set(calculationsCacheValue.distanceWithoutTerrain);
            this._recalculationFlag.set(false);
            console.info(
              'Distance without terrain result has taken from cache (by setDistanceWithoutTerrain fn)',
            );
            return true;
          } else {
            console.info(
              'Invalid distance without terrain result in cache (by setDistanceWithoutTerrain fn)',
            );
          }
        }
      }
      // ------------------------------- //
      const polylinePositions = cartesian3ListFromProperty(
        validPickedEnttity?.polyline?.positions?.getValue(),
      );
      if (
        polylinePositions?.length &&
        polylinePositions.length > 1 &&
        polylinePositions[1] instanceof Cesium.Cartesian3
      ) {
        const cachedPointsData: Array<{
          position: Cesium.Cartesian3;
          distance: number;
          distanceText: string;
        }> = [];
        let distance: number = 0;
        cachedPointsData.push({
          position: polylinePositions[0],
          distance: distance,
          distanceText: Humanify.distanceM(distance),
        });
        // Notice: первая точка всегда 0, последняя - общая протяженность
        for (let i = 1; i <= polylinePositions.length - 1; i++) {
          const prevPos = polylinePositions[i - 1];
          const nowPos = polylinePositions[i];
          const distanceChunk = await this.$viewerService.calculatePosDistances(
            [prevPos, nowPos],
            false,
            undefined,
            false,
          );
          if (typeof distanceChunk === 'number') {
            distance += distanceChunk;
            const distanceChunkText = Humanify.distanceM(distance);
            cachedPointsData.push({
              position: nowPos,
              distance: distance,
              distanceText: distanceChunkText,
            });
            if (i === polylinePositions.length - 1) {
              const calculationsCacheValue: CalculationsCacheValue = {
                distanceWithTerrain: undefined,
                distanceWithoutTerrain: distance,
                points: cachedPointsData,
              };
              // Notice: основной параметр ключа "distanceWithoutTerrain" требует изменения
              newCacheKey.distanceWithoutTerrain = distance;
              this.pushCalculationsCache(newCacheKey, calculationsCacheValue);
              this._distanceWithoutTerrain.set(distance);
              this._recalculationFlag.set(false);
              // console.log(this.getCalculationsFromCache(newCacheKey));
            }
          } else {
            throw new Error('Invalid distanceChunk result in setDistanceWithoutTerrain fn');
          }
        }
        return true;

        // Deprecated (без кэширования данных для точек)
        // const withHumanify = false;
        // const calculation: string | number = await this.$viewerService.calculatePosDistances(
        //   polylinePositions,
        //   false,
        //   undefined,
        //   withHumanify,
        // );
        // if (typeof calculation === 'number') {
        //   this._distanceWithoutTerrain.set(calculation);
        //   return true;
        // } else {
        //   console.log(
        //     ('Invalid distance calculation result in setDistanceWithoutTerrain fn'),
        //   );
        // }
      } else {
        throw new Error('Invalid polylinePositions array in setDistanceWithoutTerrain fn');
      }
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  private _distanceWithoutTerrainDescription = computed<string>(() => {
    try {
      const distanceWithoutTerrain = this._distanceWithoutTerrain();
      let distanceWithoutTerrainText: string;
      if (!distanceWithoutTerrain) {
        distanceWithoutTerrainText = '';
      } else {
        distanceWithoutTerrainText = Humanify.distanceM(distanceWithoutTerrain);
      }
      return distanceWithoutTerrainText;
    } catch (error: unknown) {
      reportError(error);
      return '';
    }
  });
  // Используется в calculate-line-floating-window.html
  get distanceWithoutTerrainDescription() {
    return this._distanceWithoutTerrainDescription;
  }

  // -------------------------------------------- //

  // Используется в хэндлерах инпутов calculate-line-floating-window.html и местном effect.
  // Отработает независимо от флага перерасчета при:
  // - сдвиге точки сущности.
  // - onchange-событии чекбокса расчета по рельефу,
  // - смене шага измерений по рельефу,
  // - смене terrain-провайдера,
  public async setNewEntityLabelsText(
    validPickedEnttity: Cesium.Entity | undefined,
    detailed: boolean,
    distanceSegmentLengthM?: number,
  ): Promise<boolean> {
    try {
      if (this.isActive() === true || this._measureHasStarted() === true) {
        return false;
      }
      if (validPickedEnttity === undefined || !(validPickedEnttity instanceof Cesium.Entity)) {
        console.info('Invalid line entity in setNewEntityLabelsText fn');
        return false;
      }
      const polylinePositions = cartesian3ListFromProperty(
        validPickedEnttity.polyline?.positions?.getValue(),
      );
      if (
        !polylinePositions?.length ||
        polylinePositions.length < 2 ||
        !(polylinePositions[1] instanceof Cesium.Cartesian3)
      ) {
        console.info('Invalid polylinePositions array in setNewEntityLabelsText fn');
        return false;
      }
      // ------------------------------- //
      const indexGroup = this.linearMeasurementsLinesList().findIndex((group) =>
        !!group && validPickedEnttity.id.startsWith(group.groupId),
      );
      if (indexGroup === -1) {
        console.info("Index for entities group in store hasn't found in setNewEntityLabelsText fn");
        return false;
      }
      const group = this.linearMeasurementsLinesList()[indexGroup];
      const entitiesList = group?.entitiesList;
      // Notice: минимально - две точки и линия
      if (!entitiesList || entitiesList.length < 3) {
        console.info('Invalid entitiesList array in setNewEntityLabelsText fn');
        return false;
      }
      // ------------------------------- //
      const cacheKey: CalculationsCacheKey = {
        validEntityId: validPickedEnttity?.id,
        terrainName: detailed ? this._nowTerrainName() : undefined,
        distanceSegmentLengthM: detailed ? this.distanceSegmentLengthM() : undefined,
        distanceWithoutTerrain: this.distanceWithoutTerrain(),
      };
      // Нормальный сценарий (расчеты уже проведены ранее и закешированы)
      const calculationsCacheValue: CalculationsCacheValue | undefined =
        this.getCalculationsFromCache(cacheKey);
      if (calculationsCacheValue !== undefined) {
        const cachedPoints: Array<{
          position: Cesium.Cartesian3;
          distance: number;
          distanceText: string;
        }> = calculationsCacheValue?.points;
        if (
          cachedPoints?.length &&
          cachedPoints.length > 1 &&
          cachedPoints?.[0]?.position &&
          cachedPoints?.[0]?.distanceText
        ) {
          let cacheCounter: number = 0;
          for (let i = 0; i <= cachedPoints.length - 1; i++) {
            const targetEntityIndex = entitiesList.findIndex((entity) => {
              // Notice: у точек polyline === undefined
              if (entity?.polyline === undefined && entity?.position) {
                const entityPos = cartesianFromProperty(entity.position.getValue());
                if (!entityPos) return false;
                const entityPosSer = JSON.stringify(entityPos);
                const cachedPosSer = JSON.stringify(cachedPoints[i].position);
                if (entityPosSer === cachedPosSer) {
                  return true;
                } else {
                  return false;
                }
              } else {
                return false;
              }
            });
            if (targetEntityIndex === -1) {
              continue;
            } else {
              let distanceText = cachedPoints[i].distanceText;
              const targetEntity = entitiesList[targetEntityIndex];
              if (typeof distanceText === 'string' && targetEntity?.label) {
                targetEntity.label.text = new Cesium.ConstantProperty(distanceText);
                cacheCounter++;
              } else {
                console.info('Invalid distanceText result in setNewEntityLabelsText fn');
              }
            }
          }
          if (cacheCounter !== polylinePositions.length) {
            console.info("Getting poit's labels from cache failed (in setNewEntityLabelsText fn)");
            // Будет осуществлен перерасчет (ниже)
          } else {
            // Сообщение отключено, т.к. это нормальный сценарий (оставлено для тестов)
            // console.log(
            //   (
            //     'Entities labels text have taken from cache (by setNewEntityLabelsText fn)',
            //   ),
            // );
            return true;
          }
        } else {
          console.info('Invalid cached points array in cache (by setNewEntityLabelsText fn)');
          // Будет осуществлен перерасчет (ниже)
        }
      }
      // ------------------------------- //
      // Резервный сценарий (перерасчет)
      let calcCounter: number = 0;
      let distance: number = 0;
      // Notice: первая точка всегда 0, последняя - общая протяженность
      for (let i = 1; i <= polylinePositions.length - 1; i++) {
        const prevPos = polylinePositions[i - 1];
        const nowPos = polylinePositions[i];
        const targetEntityIndex = entitiesList.findIndex((entity) => {
          // Notice: у точек polyline === undefined
          if (entity?.polyline === undefined && entity?.position) {
            const entityPos = cartesianFromProperty(entity.position.getValue());
            if (!entityPos) return false;
            const entityPosSer = JSON.stringify(entityPos);
            const nowPosSer = JSON.stringify(nowPos);
            if (entityPosSer === nowPosSer) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        });
        if (targetEntityIndex === -1) {
          continue;
        } else {
          let distanceText;
          const distanceChunk = await this.$viewerService.calculatePosDistances(
            [prevPos, nowPos],
            detailed,
            distanceSegmentLengthM || this.distanceSegmentLengthM(),
            false,
          );
          if (typeof distanceChunk === 'number') {
            distance += distanceChunk;
            distanceText = Humanify.distanceM(distance);
          } else {
            throw new Error('Invalid distanceChunk result in setNewEntityLabelsText fn');
          }
          const targetEntity = entitiesList[targetEntityIndex];
          if (typeof distanceText === 'string' && targetEntity?.label) {
            targetEntity.label.text = new Cesium.ConstantProperty(distanceText);
            calcCounter++;
          } else {
            throw new Error('Invalid distanceText result in setNewEntityLabelsText fn');
          }
        }
      }
      // "- 1", так как первая (нулевая) позиция пропускается
      if (calcCounter !== polylinePositions.length - 1) {
        console.info("Not all poit's labels have rewritten in setNewEntityLabelsText fn");
        return false;
      }

      console.info("Poit's labels have recalculated (in setNewEntityLabelsText fn)");
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  // ---------------------- Блок для перерасчетов дистанции по рельефу (end) -------------------------- //
}
