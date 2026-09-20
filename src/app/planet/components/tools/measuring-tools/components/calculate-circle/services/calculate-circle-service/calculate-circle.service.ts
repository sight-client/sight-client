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
import * as Humanify from '@/common/lib/humanify.lib';

// Запровайден в planet.ts
@Injectable()
export class CalculateCircleService {
  // --------------------- Блок для хранения основных состояний сервиса (start) ----------------------- //
  // Еще используется в calculate-circle-floating-window.ts
  public readonly calculateCircleList = computed(() =>
    this.$measureService.calculateCircleList(),
  );
  // Еще используется в calculate-circle.ts
  public readonly measuresBlocker = computed(() => this.$toolsService.drawingsBlocker());
  private _isActive = signal<boolean>(false);
  // Еще используется в calculate-circle.ts и в сервисе плавающего окна инструмента
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
        if (this.calculateCircleList()) {
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
  private readonly circleAreaGroupsCounter = computed<number>(
    () => this.calculateCircleList().length,
  );
  private readonly hasErasedAll = linkedSignal<number, boolean>({
    source: this.circleAreaGroupsCounter,
    computation(newVal, prevVal) {
      return prevVal && !newVal ? true : false;
    },
  });
  // Еще используется в calculate-circle.ts
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
  // Еще используется в calculate-circle-floating-window.service.ts
  public readonly toolName: MeasuringToolName = 'calculateCircle';
  // Используется в calculate-circle.ts
  public buttonHandler(event: MouseEvent): void {
    // event.stopPropagation(); // не применять! (событие также ловится в родителе (measuring-tools.ts))
    if (event.button === 0) {
      // if (this.$measureService.isCircles() === true) {
      //   this.$measureService.allToolEntitiesCleaning(this.toolName); // отработает effect с cancelThisTool() в сервисе плавающего окна
      //   this.buttonHandler(event);
      //   return;
      // }
      this.toggleDrawing();
    } else if (event.button === 1) {
      if (this._measureHasStarted() === false) {
        this.$measureService.allToolEntitiesCleaning(this.toolName); // cancelThisTool() сработает по эффекту
      } else {
        this.$measureService.removeTemporalEntities();
        if (this.circleAreaGroupsCounter()) {
          this.$measureService.allToolEntitiesCleaning(this.toolName);
        } else this.cancelThisTool();
      }
    }
  }
  private toggleDrawing(): void {
    try {
      if (this.isActive() === false && !this.measuresBlocker()) {
        if (this.$measureService.isCircles() === true) {
          // Отработает effect с cancelThisTool() в сервисе плавающего окна
          this.$measureService.allToolEntitiesCleaning(this.toolName);
          // Ждем его и перезапускаем
          setTimeout(this.toggleDrawing.bind(this), 100);
          return;
        }
        this.isActive.set(true);
        this.drawCircleAreaMeasureGraphics({
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
  private drawCircleAreaMeasureGraphics(options: MeasureOptions = {}): boolean {
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
      optForPolygon.id = `${groupIdChank}-${this.toolName}-ellipse-${Math.ceil(Math.random() * 1000000)}`;
      if (options?.name) optForPolygon.name = options.name; // при завершении сценария прибавится площадь
      const optForLine: MeasureOptions = cloneDeep(options);
      optForLine.id = `${groupIdChank}-${this.toolName}-line-${Math.ceil(Math.random() * 1000000)}`;
      if (options?.name) optForLine.name = options.name + ' ' + '(auxiliary)'; // при завершении сценария прибавится радиус;

      let ellipseEntity: Cesium.Entity | undefined = undefined;
      let lineEntity: Cesium.Entity | undefined = undefined;
      let startPos: Cesium.Cartesian3 | undefined = undefined;

      const polygonHierarchy: Cesium.PolygonHierarchy = new Cesium.PolygonHierarchy();
      // "Сигналы" для колбэков ниже
      // Для эллипса, по которому будет рассчитана полилиния для полигона (Cesium.Entity.ellipse.outline не поддерживает наложение на рельеф)
      let polylinePositionsMain: Array<Cesium.Cartesian3> = [];
      let labelPositionMain: Cesium.Cartesian3 = Cesium.Cartesian3.ZERO;
      const labelTextGagOne: string = 'Центральная точка';
      let labelTextMain: string = this.$toolsService.isMobile ? labelTextGagOne : '';
      let radius: number = 0;
      // Для линии, которая используется для показа линии радиуса (также с возможностью привязки к рельефу) и его значения (отдельно от общей площади окружности)
      let polylinePositionsLine: Array<Cesium.Cartesian3> = [];
      let labelPositionLine: Cesium.Cartesian3 = Cesium.Cartesian3.ZERO;
      let labelTextLine: string = '';
      // Присваиваются параметрам ellipseEntity после ее создания
      const reactivePolylinePositionsMain: Cesium.CallbackProperty = new Cesium.CallbackProperty(
        () => polylinePositionsMain,
        false,
      );
      const reactiveLabelPositionMain: Cesium.CallbackPositionProperty =
        new Cesium.CallbackPositionProperty(() => labelPositionMain, false);
      const reactiveLabelTextMain: Cesium.CallbackProperty = new Cesium.CallbackProperty(
        () => labelTextMain,
        false,
      );
      const reactiveRadius = new Cesium.CallbackProperty(() => {
        if (polylinePositionsMain?.[0] && polylinePositionsMain?.[1]) {
          return Cesium.Cartesian3.distance(polylinePositionsMain[0], polylinePositionsMain[1]);
        } else return 0.0;
      }, false);
      // Присваиваются параметрам lineEntity после ее создания
      const reactivePolylinePositionsLine: Cesium.CallbackProperty = new Cesium.CallbackProperty(
        () => polylinePositionsLine,
        false,
      );
      const reactiveLabelPositionLine: Cesium.CallbackPositionProperty =
        new Cesium.CallbackPositionProperty(() => labelPositionLine, false);
      const reactiveLabelTextLine: Cesium.CallbackProperty = new Cesium.CallbackProperty(
        () => labelTextLine,
        false,
      );
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

      // ЛКМ (получение startPos, создание, отображение и добавление во временную коллекцию новых сущностей)
      const startMeasure = async (
        movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent,
      ): Promise<void> => {
        try {
          if (
            (ellipseEntity !== undefined || lineEntity !== undefined) &&
            !this.$toolsService.isMobile
          ) {
            return; // обработка лишних кликов
          }
          // Второй возможный клик
          if (ellipseEntity && lineEntity && this.$toolsService.isMobile) {
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
            // throw new Error('Start position is undefined in drawCircleAreaMeasureGraphics()');
            this.cancelThisTool();
            return;
          }
          const movePos = startPos.clone();

          if (polylinePositionsLine.length !== 0) {
            polylinePositionsLine = [];
          }
          polylinePositionsLine = [startPos, movePos];
          labelPositionLine = movePos;
          if (polylinePositionsMain.length !== 0) {
            polylinePositionsMain = [];
          }
          polylinePositionsMain = [startPos, movePos];
          labelPositionMain = startPos;

          // Создание сущностей
          lineEntity = this.$toolsService.setLineEntity(
            polylinePositionsLine,
            labelPositionLine,
            labelTextLine,
            optForLine,
          );
          ellipseEntity = this.$toolsService.setEllipseEntity(
            polylinePositionsMain,
            labelPositionMain,
            labelTextMain,
            radius,
            radius,
            Cesium.Cartographic.fromCartesian(labelPositionMain).height,
            optForPolygon,
          );

          // Добавление реактивности
          if (ellipseEntity && lineEntity) {
            if (
              this.$measureService
                .temporalEntitiesList()
                .findIndex((item) => item?.id === ellipseEntity?.id) !== -1
            ) {
              throw new Error('Entity already exist in temporal store by setEllipseEntity()');
            }
            if (
              this.$measureService
                .temporalEntitiesList()
                .findIndex((item) => item?.id === lineEntity?.id) !== -1
            ) {
              throw new Error('Entity already exist in temporal store by setLineEntity()');
            }
            if (lineEntity.polyline?.positions)
              lineEntity.polyline.positions = reactivePolylinePositionsLine;
            if (lineEntity.position) lineEntity.position = reactiveLabelPositionLine;
            if (lineEntity.label?.text) lineEntity.label.text = reactiveLabelTextLine;

            if (ellipseEntity.polyline?.positions)
              ellipseEntity.polyline.positions = reactivePolylinePositionsMain;
            if (ellipseEntity.position) ellipseEntity.position = reactiveLabelPositionMain;
            if (ellipseEntity.label?.text) ellipseEntity.label.text = reactiveLabelTextMain;
            if (ellipseEntity.ellipse) {
              ellipseEntity.ellipse.semiMinorAxis = reactiveRadius;
              ellipseEntity.ellipse.semiMajorAxis = reactiveRadius;
            }
            if (ellipseEntity.ellipse)
              ellipseEntity.ellipse.show = new Cesium.ConstantProperty(false); // необходим только для расчетов, плюс границы эллипса, формирующиеся обычно по двум точкам, будут "испорчены" новым "фантомом" окружности для полилинии
            // Для привязке к рельефу заливки теперь используем полигон, а не эллипс (polylinePositionsMain определяет и hierarchy.positions полигона)
            ellipseEntity.polygon = new Cesium.PolygonGraphics({
              material: new Cesium.ColorMaterialProperty(Cesium.Color.WHITE.withAlpha(0.1)),
              perPositionHeight: new Cesium.ConstantProperty(!options?.clampToGround),
              hierarchy: new Cesium.CallbackProperty(() => polygonHierarchy, false),
            });

            if (!labelTextLine && lineEntity?.label?.show?.getValue() === true) {
              lineEntity.label.show = new Cesium.ConstantProperty(false);
            }
            if (!labelTextMain && ellipseEntity?.label?.show?.getValue() === true) {
              ellipseEntity.label.show = new Cesium.ConstantProperty(false);
            }

            // Отрисовка сущностей и обновление временной коллекции
            this.$measureService.addNewEntityToMeasureLayer(lineEntity);
            this.$measureService.temporalEntitiesList.update((arr) => [...arr, lineEntity]);
            this.$measureService.addNewEntityToMeasureLayer(ellipseEntity);
            this.$measureService.temporalEntitiesList.update((arr) => [...arr, ellipseEntity]);
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

      // Перемещение курсора (применение новой movePos к параметрам сущностей через ранее привязанные Cesium.CallbackProperty)
      const continueMeasure = async (
        movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent,
      ): Promise<void> => {
        try {
          if (!startPos) return;
          if (polylinePositionsMain.length < 2 || polylinePositionsLine.length < 2) return;
          if (ellipseEntity === undefined || lineEntity === undefined) return;
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
          labelPositionLine = movePos;
          polylinePositionsLine = [startPos, movePos];
          // По прямой (без учета эллипсоида)
          // const distance = Cesium.Cartesian3.distance(startPos, movePos);
          // По дуге (с учетом эллипсоида и высоты точек)
          const distance = MeasuresLib.calculatePosDistancesWhithoutHumanify(polylinePositionsLine);
          labelTextLine = Humanify.distanceM(distance);
          polylinePositionsMain = [startPos, movePos];
          radius = distance;
          const area = 3.14 * Math.pow(radius, 2);
          labelTextMain = Humanify.areaKm(Math.abs(area));
          const polylinePositionsForCircle = getCircle(ellipseEntity);
          if (polylinePositionsForCircle.length) {
            polylinePositionsMain = polylinePositionsForCircle;
            polygonHierarchy.positions = polylinePositionsForCircle;
          }
          if (lineEntity?.label?.show?.getValue() === false && labelTextLine) {
            lineEntity.label.show = new Cesium.ConstantProperty(true);
          }
          if (ellipseEntity?.label?.show?.getValue() === false && labelTextMain) {
            ellipseEntity.label.show = new Cesium.ConstantProperty(true);
          }
        } catch (error: unknown) {
          this.cancelThisTool();
          console.log(chalk.red(error));
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      this.$toolsService.setCommonHandler(continueMeasure, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      // ПКМ (перенос ellipseEntity из временного в свой стор)
      const finishMeasure = async (
        _movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent,
      ): Promise<void> => {
        try {
          if (this._measureHasStarted() === false) {
            // console.log('Отмена сценария');
            this.cancelThisTool();
            return;
          }
          if (ellipseEntity === undefined || lineEntity === undefined) {
            throw new Error('Entity is not defined in drawCircleAreaMeasureGraphics()');
          }
          if (startPos === undefined) {
            // throw new Error('Start position is undefined in drawCircleAreaMeasureGraphics()');
            this.cancelThisTool();
            return;
          }
          if (
            polylinePositionsLine.length < 2 ||
            Cesium.Cartesian3.equals(
              startPos,
              polylinePositionsLine[polylinePositionsLine.length - 1],
            )
          ) {
            console.log(chalk.blue('End & start positions are equal'));
            this.cancelThisTool();
            return;
          }
          this.$viewerService.offEntityPickingBlock();
          this.$toolsService.clearCommonHandler();

          // Значения (с точной координатой) уже получены в continueMeasure-хэндлере
          // const mouseEntity: Cesium.Entity = await this.$toolsService.getMouseEntity();
          // const endPos: Cesium.Cartesian3 | undefined = mouseEntity?.position?.getValue();
          // if (endPos === undefined) {
          //   // throw new Error('End position is undefined in drawCircleAreaMeasureGraphics()');
          //   this.cancelThisTool();
          //   return;
          // }
          // if (Cesium.Cartesian3.equals(startPos, endPos)) {
          //   console.log(chalk.blue('End & start positions are equal'));
          //   this.cancelThisTool();
          //   return;
          // }
          // const distance = Cesium.Cartesian3.distance(startPos, endPos);
          // polylinePositionsLine = [startPos, endPos];
          // labelPositionLine = endPos;
          // labelTextLine = Humanify.distanceM(distance);

          // polylinePositionsMain = [startPos, endPos];
          // radius = distance;
          // const area = 3.14 * Math.pow(radius, 2);
          // labelTextMain = Humanify.areaKm(Math.abs(area));
          // const polylinePositionsForCircle = getCircle(ellipseEntity);
          // polylinePositionsMain = polylinePositionsForCircle;
          // polygonHierarchy.positions = polylinePositionsForCircle;

          if (ellipseEntity?.label) {
            if (options?.name && ellipseEntity.name) {
              ellipseEntity.name = `${ellipseEntity.name} ${labelTextMain}`;
            }
            if (options?.hideLabel) {
              ellipseEntity.label.show = new Cesium.ConstantProperty(false);
            }
          }
          if (lineEntity?.label) {
            if (options?.name && lineEntity.name) {
              lineEntity.name = `${lineEntity.name} ${labelTextLine}`;
            }
            if (options?.hideLabel) {
              lineEntity.label.show = new Cesium.ConstantProperty(false);
            }
          }

          this.$measureService.pushGroupFromTemporal(
            groupIdChank,
            options?.toolName,
            ellipseEntity,
          );
          this.$measureService.clearTemporalEntitiesList(groupIdChank);
          this.$viewerService.setNewPickedEntity(ellipseEntity);

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

      function getCircle(ellipseEntity: Cesium.Entity): Array<Cesium.Cartesian3> {
        if (!ellipseEntity?.ellipse) throw new Error('Entity ellipse is undefined in getCircle()');
        if (
          !ellipseEntity?.position?.getValue() ||
          !ellipseEntity.ellipse?.semiMajorAxis ||
          !ellipseEntity.ellipse?.semiMinorAxis
        )
          throw new Error('Entity is not valid in getCircle()');
        const ellipse = ellipseEntity?.ellipse;
        const position = ellipseEntity?.position?.getValue();
        const semiMajor = ellipse?.semiMajorAxis?.getValue();
        const semiMinor = ellipse?.semiMinorAxis?.getValue();
        const rotation = ellipse?.rotation?.getValue();

        const geometry = new Cesium.EllipseOutlineGeometry({
          center: position || Cesium.Cartesian3.ZERO,
          semiMajorAxis: semiMajor || 0.0,
          semiMinorAxis: semiMinor || 0.0,
          rotation: rotation || 0,
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
