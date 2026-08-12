import { Injectable, signal, WritableSignal } from '@angular/core';
import * as Cesium from 'cesium';
import chalk from 'chalk';
import cloneDeep from 'lodash/cloneDeep';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import type { CustomViewer } from '@/common/services/viewer-service/viewer.service';
import { CoordSystems } from '@/common/lib/coord-sistems.lib';
import type { CRS } from '@/common/lib/coord-sistems.lib';
import { MouseCoordsService } from '@/common/services/mouse-coords-service/mouse-coords.service';
import * as MeasuresLib from '@/common/services/measure-service/lib/basic-measure-calculations.lib';
import { DeviceService } from '@global/services/device-service/device.service';

// ------------------------------------------------------------- Блок замечаний --------------------------------------------------- //

// Типизация присвоения значений Cesium.Property оставляет желать лучшего. Остается только "// @ts-ignore"

// ----------------------------------------------------------- Блок для типизации ------------------------------------------------- //

export interface MeasureOptions {
  toolName?: ToolName; // global important!
  groupId?: string; // localLy important!
  id?: string;
  name?: string;
  reuse?: boolean;
  destroy?: boolean;
  callback?: Function;
  description?: string;
  billboard?: { show?: boolean; [key: string]: unknown };
  label?: { text?: string; show?: boolean; font: string; [key: string]: unknown };
  withCoordsDesc?: boolean;
  withoutHeightDesc?: boolean;
  color?: Cesium.Color;
  polyline?: { [key: string]: unknown };
  material?: Cesium.Color;
  width?: number;
  clampToGround?: boolean;
  horizontal?: boolean;
  arrow?: boolean;
  pixelSize?: number;
  font?: string;
  maximumCone?: number;
  [key: string]: unknown;
}

interface EntitiesGroup {
  groupId: string;
  entitiesList: Array<Cesium.Entity | undefined>;
}

// Пополнять при добавлении новых инструментов
export type ToolName = 'addMark' | 'linearMeasurements' | 'route';
export function getRusToolName(toolName: ToolName) {
  switch (toolName) {
    case 'addMark':
      return 'Метки';
    case 'linearMeasurements':
      return 'Линейные измерения';
    // case 'addMark':
    //   return 'Метки';
    case 'route':
      return 'Маршрут';
  }
}

// ----------------------------------------------------------- Блок базовых установок --------------------------------------------- //

@Injectable()
export class MeasureService {
  constructor(
    private $viewerService: ViewerService,
    private $mouseCoordsService: MouseCoordsService,
    private $deviceService: DeviceService,
  ) {}

  // Обход типов здесь применен для предотвращения последующих принуждений к проверкам на undefined
  public _viewer: CustomViewer = {} as CustomViewer;

  //------------------------------------------------------------ //

  // Сервис стартует вместе с viewer'ом и координатами под курсором в директиве app-cesium.directive.ts
  public measureServiceHasStarted = signal<boolean>(false);
  public async startMeasureService(): Promise<void> {
    try {
      // Ссылка, позволяющая локально изменять главный viewer - из ViewerService (для сокращения кода)
      this._viewer = this.$viewerService.viewer;
      this._viewer.measure = {
        drawLayer: new Cesium.CustomDataSource('measureLayer'),
        drawRoute: new Cesium.GeoJsonDataSource('measureRoute'),
      };
      await this._viewer?.dataSources.add(this._viewer.measure.drawLayer);
      await this._viewer?.dataSources.add(this._viewer.measure.drawRoute);
      this.measureServiceHasStarted.set(true);
    } catch (error: unknown) {
      if (this?._viewer?.measure) this._viewer.measure = undefined;
      // this.clearMeasuresDataSource();
      // this.clearRouteDataSources();
      if (this.measureServiceHasStarted() === true) this.measureServiceHasStarted.set(false);
      console.log(chalk.red('Ошибка старта MeasureService'));
      throw error;
    }
  }

  //------------------------------------------------------------ //

  // Можно брать сущность и из вьюера (доступ продублирован для обратной совместимости),
  // но верным будет импользовать именно состояние сервиса, обеспечивающего соответствующую функциональность.
  public getMouseEntity(): Cesium.Entity {
    // return this._viewer.dataSources
    //   .getByName('mousePosition')[0]
    //   .entities.getById('mouse') as Cesium.Entity;
    // Обход типов здесь применен для предотвращения последующих принуждений к проверкам на undefined
    // Если underMouseEntity() === undefined, то данный сервис вообще не будет запущен (условие в app-cesium.directive.ts).
    return this.$mouseCoordsService.underMouseEntity() as Cesium.Entity;
  }

  //------------------------------------------------------------ //

  // Реактивные массивы сущностей, созданных функциями данного сервиса
  // Реактивные массивы сущностей, созданных функциями данного сервиса. Также используются в модальных окнах инструментов.
  public marksList = signal<Array<EntitiesGroup | undefined>>([]);
  public linearMesurmentsLinesList = signal<Array<EntitiesGroup | undefined>>([]);

  public routeEntityList = signal<Array<EntitiesGroup | undefined>>([]); // хранилище для большого количества сущностей специфичного инструмента
  public allEntitiesListsLinks: {
    [P in ToolName]: WritableSignal<Array<EntitiesGroup | undefined>>;
  } = {
    // prettier-ignore
    'addMark': this.marksList,
    // prettier-ignore
    'linearMeasurements': this.linearMesurmentsLinesList,

    // prettier-ignore
    'route': this.routeEntityList,
  };

  public overEntitiesList = signal<Array<EntitiesGroup | undefined>>([]); // резервное хранилище для инструментов (вне состава allEntitiesListsLinks)
  public temporalEntitiesList = signal<Array<Cesium.Entity | undefined>>([]); // хранилище для инструментов в процессе построения (БЕЗ ГРУППИРОВКИ)

  private pushGroupFromTemporal(groupIdChank: string, toolName?: ToolName): boolean {
    try {
      const targetList: WritableSignal<Array<EntitiesGroup | undefined>> = toolName
        ? this.allEntitiesListsLinks[toolName]
        : this.overEntitiesList;
      const index = targetList().findIndex((item) => item?.groupId === groupIdChank);
      if (index === -1) {
        targetList.update((arr) => {
          arr.push({ groupId: groupIdChank, entitiesList: this.temporalEntitiesList() });
          return [...arr];
        });
      } else {
        targetList.update((arr) => {
          arr[index]?.entitiesList.push(...this.temporalEntitiesList());
          return [...arr];
        });
      }
      return true;
    } catch (error) {
      console.log(chalk.red(error));
      return false;
    }
  }
  private pushGroupWithoutTemporal(
    entities: Array<Cesium.Entity>,
    groupIdChank: string,
    toolName?: ToolName,
  ): boolean {
    try {
      const targetList: WritableSignal<Array<EntitiesGroup | undefined>> = toolName
        ? this.allEntitiesListsLinks[toolName]
        : this.overEntitiesList;
      const index = targetList().findIndex((item) => item?.groupId === groupIdChank);
      if (index === -1) {
        targetList.update((arr) => {
          arr.push({ groupId: groupIdChank, entitiesList: entities });
          return [...arr];
        });
      } else {
        targetList.update((arr) => {
          arr[index]?.entitiesList.push(...entities);
          return [...arr];
        });
      }
      return true;
    } catch (error) {
      console.log(chalk.red(error));
      return false;
    }
  }
  private clearTemporalEntitiesList(groupIdChank?: string): boolean {
    try {
      if (this.temporalEntitiesList().length) {
        if (groupIdChank) {
          this.temporalEntitiesList.update((arr) => {
            arr = arr.filter((item) => !item?.id.startsWith(groupIdChank));
            return [...arr];
          });
        } else {
          this.temporalEntitiesList.set([]);
        }
      } else {
        console.log('temporalEntitiesList() is empty in clearTemporalEntitiesList fn');
      }
      return true;
    } catch (error) {
      console.log(chalk.red(error));
      return false;
    }
  }
  //------------------------------------------------------------ //

  // Блокировка (на уровне сервиса и представления) новых расчетов до окончания предыдущих
  public measuresBlocker = signal<boolean>(false);
  // Для инструментов не использующих this.handler
  public setMeasuresBlocker(newVal: boolean): void {
    this.measuresBlocker.set(newVal);
  }

  // Состояние для хранения событий к/л взаимодействий пользователя с холстом Cesium (нанесение метки, линии и пр.)
  // Всегда должно хранить коллбэки только от одного инструмента и только во время его работы
  public handler = signal<Cesium.ScreenSpaceEventHandler | undefined>(undefined);
  public clearHandler(): boolean {
    try {
      if (this.handler() !== undefined) {
        if (this.handler() instanceof Cesium.ScreenSpaceEventHandler) {
          this.handler()?.destroy();
          if (this.handler()?.isDestroyed()) {
            this.handler.set(undefined);
            return true;
          } else {
            throw new Error('Error whith cleaning measure handler');
          }
        } else {
          this.handler.set(undefined);
          return true;
        }
      } else return true;
    } catch (error: unknown) {
      if (this.$viewerService.entityPickingBlock) this.$viewerService.offEntityPickingBlock();
      if (this.measuresBlocker() === true) this.measuresBlocker.set(false);
      throw error;
    }
  }

  // Сценарий отмены выполнения дальнейших расчетов
  public cancelTool(): void {
    this.clearHandler();
    if (this.measuresBlocker() === true) {
      this.measuresBlocker.set(false);
    }
    if (this.$viewerService.entityPickingBlock) this.$viewerService.offEntityPickingBlock();
  }

  // ---------------------------------------------------- Блок создания примитивов ------------------------------------------------ //

  // Создание сущности точки для последующей постановки на карту (переиспользуется в большинстве инструментов)
  private setPointEntity(
    position: Cesium.Cartesian3 | undefined,
    options: MeasureOptions = {},
  ): Cesium.Entity | undefined {
    try {
      if (position === undefined) throw new Error('Position arg is undefined in setPointEntity()');
      const pointEntity = new Cesium.Entity({
        id: options?.id || `${Math.ceil(Math.random() * 1000000)}`,
        name: options?.name || `${'point'}`,
        position: position,
        billboard: options?.billboard || undefined,
        label: options?.label || undefined,
        description: options?.description || `${this.getMouseEntity()?.label?.text}`,
      });
      return pointEntity;
    } catch (error) {
      this.cancelTool();
      console.log(chalk.red(error));
      return undefined;
    }
  }

  // Создание сущности линии для последующей постановки на карту (переиспользуется в большинстве инструментов)
  private setLineEntity(
    reactivePolylinePositions: Array<Cesium.Cartesian3 | undefined>,
    reactiveLabelPosition: Cesium.Cartesian3,
    reactiveLabelText: string,
    options: MeasureOptions = {},
  ): Cesium.Entity | undefined {
    try {
      if (!reactivePolylinePositions?.length)
        throw new Error('Positions arg is undefined in setLineEntity()');
      const lineEntity = new Cesium.Entity({
        id: options?.id || `${Math.ceil(Math.random() * 1000000)}`,
        name: options?.name || `${'line'}`,
        position: new Cesium.CallbackPositionProperty(() => reactiveLabelPosition, false),
        label: options?.label || {
          text: new Cesium.CallbackProperty(() => reactiveLabelText, false),
          show: true,
          showBackground: true,
          font: options?.font || '14px monospace',
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(-20, -40),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        polyline: options?.polyline || {
          positions: new Cesium.CallbackProperty(() => reactivePolylinePositions, false),
          width: options?.width || 3,
          material: options?.material || Cesium.Color.CHOCOLATE.withAlpha(0.8),
          clampToGround: options?.clampToGround || this.$viewerService?.clampToGroundSignal?.(),
        },
      });
      return lineEntity;
    } catch (error) {
      this.cancelTool();
      console.log(chalk.red(error));
      return undefined;
    }
  }

  // --------------------------------------------------------- Блок построения точки ---------------------------------------------- //

  // Main-функция инструмента add-mark.ts
  public drawPointGraphics(options: MeasureOptions = {}): boolean {
    try {
      if (this.measuresBlocker() === true) return false;
      this.clearHandler();
      this.measuresBlocker.set(true);
      let groupIdChank: string;
      if (options?.groupId === undefined) {
        groupIdChank = `${Math.ceil(Math.random() * 1000000)}`; // используется для смыслового объединения всех сущностей одного сценария работы инструмента (groupId)
      } else {
        groupIdChank = options.groupId;
      }
      const opt: MeasureOptions = cloneDeep(options);
      // Под options.name ожидается (не обязательно) название ts-файла инструмента (например, add-mark) - может использоваться для очистки сразу всех сущностей одного из инструментов (сейчас удаляется по кастомному свойству сущности toolName)
      opt.id = `${groupIdChank}-point${options?.name ? '-' + options.name : ''}`;
      // Точка (свойство point) не отображается на некоторых видеокартах (заменена билбордом)
      opt.billboard = options?.billboard || {
        image: 'assets/planet/measuring-tools/map-position_white.png',
        height: 32, // как в .kml (оригинальный размер метки 64x64)
        width: 32,
        color: options?.color || Cesium.Color.RED.withAlpha(1),
        disableDepthTestDistance: Number.POSITIVE_INFINITY, // иначе заходит на рельеф
        pixelOffsetScaleByDistance: new Cesium.NearFarScalar(2414016, 1, 16093000, 0.1), // как в .kml
        scaleByDistance: new Cesium.NearFarScalar(2414016, 1, 16093000, 0.1), // как в .kml
      };
      opt.label = options?.label || {
        text: options?.name || `${'mark'}`,
        showBackground: true,
        backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.4),
        font: options?.font || '16px sans-serif', // как в .kml
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT, // .value === 1 - как в .kml
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        pixelOffset: new Cesium.Cartesian2(17, 0), // left top, как в .kml
        translucencyByDistance: new Cesium.NearFarScalar(3000000, 1, 5000000, 0), // как в .kml
        style: Cesium.LabelStyle.FILL, // .value === 0
        // style: Cesium.LabelStyle.FILL_AND_OUTLINE, // .value === 2 - как в .kml
        // verticalOrigin: Cesium.VerticalOrigin.TOP,
        // pixelOffset: new Cesium.Cartesian2(-65, -70), // left top
        // pixelOffsetScaleByDistance: new Cesium.NearFarScalar(2414016, 1, 16093000, 0.1),
      };
      let _pointEntity: Cesium.Entity | undefined;
      this.handler.set(new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas));
      // Кастомное свойства для отмены инструмента по Esc
      // @ts-ignore
      this.handler()._initializer = 'add-mark';
      this.handler()?.setInputAction(() => {
        // try/catch в хэндлерах позволяет приложению просто очищать неудачный опыт, а не крашиться с ошибкой
        try {
          this.clearHandler();
          this.$viewerService.onEntityPickingBlock();
          const pos: Cesium.Cartesian3 | undefined = this.getMouseEntity()?.position?.getValue();
          _pointEntity = this.setPointEntity(pos, opt);
          if (_pointEntity === undefined) return;

          // На случай, если декорирование сущности точки не требуется
          if (opt?.destroy !== true) {
            if (opt?.toolName) {
              // @ts-ignore
              _pointEntity.toolName = opt?.toolName;
            }
            if (opt.withCoordsDesc) {
              let text: string = '';
              if (opt?.withoutHeightDesc) {
                const arr: string[] = this.getMouseEntity()?.label?.text?.getValue().split('\n');
                arr.pop();
                arr.unshift('СК: ' + this.$mouseCoordsService.selectedCrs());
                text = arr.join('\n');
              } else {
                text =
                  'СК: ' +
                  this.$mouseCoordsService.selectedCrs() +
                  '\n' +
                  this.getMouseEntity()?.label?.text?.getValue();
              }
              // @ts-ignore
              _pointEntity.label!.text = text;
              // @ts-ignore
              _pointEntity.label.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
              // @ts-ignore
              _pointEntity.label.verticalOrigin = Cesium.VerticalOrigin.TOP;
              // @ts-ignore
              _pointEntity.label.pixelOffset = new Cesium.Cartesian2(0, -110);
            }
            this.pushGroupWithoutTemporal([_pointEntity], groupIdChank, opt?.toolName);
            // this.clearTemporalEntitiesList(groupIdChank); // в текущей конструкции (пока) не используется
            this._viewer?.measure?.drawLayer.entities.add(_pointEntity);
            this.$viewerService.setPickedEntity(_pointEntity);
          }
          this.$viewerService.offEntityPickingBlock();
          this.measuresBlocker.set(false);
          if (opt?.callback && typeof opt.callback === 'function') {
            opt.callback(_pointEntity, this.getMouseEntity()?.position?.getValue());
          }
          // Опция из add-mark для непрерывного нанесения меток по ПКМ
          if (opt.reuse === true) this.drawPointGraphics(options);
        } catch (error: unknown) {
          this.cancelTool();
          console.log(chalk.red(error));
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      return true;
    } catch (error: unknown) {
      this.cancelTool();
      console.log(chalk.red(error));
      return false;
    }
  }

  // --------------------------------------------------------- Блок построения линии ---------------------------------------------- //

  // Флаг для linear-measurements.ts (для деактивации инструмента по ПКМ)
  public lineMeasureHasStarted = signal<boolean>(false);
  public setLineMeasureHasStarted(newVal: boolean): void {
    this.lineMeasureHasStarted.set(newVal);
  }
  // Main-функция инструмента linear-measurements.ts
  public drawLineMeasureGraphics(options: MeasureOptions = {}): boolean {
    try {
      if (this.measuresBlocker() === true) return false;
      this.clearHandler();
      this.measuresBlocker.set(true);
      let groupIdChank: string;
      if (options?.groupId === undefined) {
        groupIdChank = `${Math.ceil(Math.random() * 1000000)}`;
      } else {
        groupIdChank = options.groupId;
      }
      const optForPoint: MeasureOptions = cloneDeep(options);
      // Начало id должно быть общим для суммы сущностей одного инструмента (для коллективного удаления)
      optForPoint.id = `${groupIdChank}-point${options?.name ? '-' + options.name : ''}-${Math.ceil(Math.random() * 1000000)}`;
      const optForLine: MeasureOptions = cloneDeep(options);
      optForLine.id = `${groupIdChank}-line${options?.name ? '-' + options.name : ''}-${Math.ceil(Math.random() * 1000000)}`;
      let _lineEntity: Cesium.Entity | undefined = undefined;

      // "Индикаторы" для колбэков ниже
      const polylinePositions: Array<Cesium.Cartesian3 | undefined> = [];
      let labelPosition: Cesium.Cartesian3 = Cesium.Cartesian3.ZERO;
      let labelText: string = '';

      // Должны быть стеке создания _lineEntity (привязаны ссылочным способом)
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

      this.handler.set(new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas));
      // @ts-ignore
      this.handler()._initializer = 'linear-measurements';

      // ЛКМ (создание линии отрезков, нанесение точек ее излома)
      this.handler()?.setInputAction(() => {
        try {
          this.lineMeasureHasStarted.set(true);
          this.$viewerService.onEntityPickingBlock();
          const startPos: Cesium.Cartesian3 | undefined =
            this.getMouseEntity()?.position?.getValue();
          if (startPos === undefined)
            throw new Error('Position arg is undefined in drawLineMeasureGraphics()');

          if (optForPoint?.id) {
            // Точки будут отличаться окончанием id
            const newIdArr: string[] = optForPoint.id.split('-');
            newIdArr[newIdArr.length - 1] = `${Math.ceil(Math.random() * 1000000)}`;
            optForPoint.id = newIdArr.join('-');
          }
          optForPoint.label = options?.label || {
            text: MeasuresLib.getPosDistances(
              MeasuresLib.transformCartesianArrayToWGS84Array(polylinePositions),
            ),
            show: true,
            showBackground: true,
            font: options?.font || '14px monospace',
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(-20, -40),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          };
          const _pointEntity: Cesium.Entity | undefined = this.setPointEntity(
            startPos,
            optForPoint,
          );
          if (_pointEntity === undefined) return;
          if (optForPoint?.toolName) {
            // @ts-ignore
            _pointEntity.toolName = optForPoint.toolName;
          }

          this._viewer.measure?.drawLayer.entities.add(_pointEntity);
          this.temporalEntitiesList.update((arr) => [...arr, _pointEntity]);

          if (polylinePositions.length === 0) {
            polylinePositions.push(startPos);
          }
          const movePos = polylinePositions.pop();
          polylinePositions.push(startPos);
          polylinePositions.push(movePos);
          labelPosition = startPos;
          labelText = MeasuresLib.getPosDistances(
            MeasuresLib.transformCartesianArrayToWGS84Array(polylinePositions),
          );
          if (_lineEntity === undefined) {
            _lineEntity = this.setLineEntity(
              polylinePositions,
              labelPosition,
              labelText,
              optForLine,
            );
            if (_lineEntity) {
              if (_lineEntity.position) _lineEntity.position = reactiveLabelPosition;
              if (_lineEntity.label?.text) _lineEntity.label.text = reactiveLabelText;
              if (_lineEntity.polyline?.positions)
                _lineEntity.polyline.positions = reactivePolylinePositions;

              if (optForLine?.toolName) {
                // @ts-ignore
                _lineEntity.toolName = optForLine.toolName;
              }

              this._viewer.measure?.drawLayer.entities.add(_lineEntity);
              this.temporalEntitiesList.update((arr) => [...arr, _lineEntity]);
            }
          }
        } catch (error: unknown) {
          this.cancelTool();
          if (this.lineMeasureHasStarted() === true) this.lineMeasureHasStarted.set(false);
          console.log(chalk.red(error));
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // Перемещение курсора (изменение последней точки полилинии)
      this.handler()?.setInputAction(() => {
        try {
          const movePos: Cesium.Cartesian3 | undefined =
            this.getMouseEntity()?.position?.getValue();
          if (polylinePositions.length < 2) return;
          if (movePos === undefined)
            throw new Error('Position arg is undefined in drawLineMeasureGraphics()');
          polylinePositions.pop(); // удалит последнюю movePos, созданную при нажатии ЛКМ
          polylinePositions.push(movePos);
          labelText = MeasuresLib.getPosDistances(
            MeasuresLib.transformCartesianArrayToWGS84Array(polylinePositions),
          );
          labelPosition = movePos;
        } catch (error: unknown) {
          this.cancelTool();
          if (this.lineMeasureHasStarted() === true) this.lineMeasureHasStarted.set(false);
          console.log(chalk.red(error));
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      // ПКМ (нанесение последней точки, сокрытие описания полилинии, сценарий закрытия инструмента)
      this.handler()?.setInputAction(() => {
        try {
          this.$viewerService.offEntityPickingBlock();
          this.clearHandler();
          if (polylinePositions.length >= 2) {
            const endPos: Cesium.Cartesian3 | undefined =
              this.getMouseEntity()?.position?.getValue();
            if (endPos === undefined)
              throw new Error('Position arg is undefined in drawLineMeasureGraphics()');
            polylinePositions.pop();
            polylinePositions.push(endPos);
            labelText = MeasuresLib.getPosDistances(
              MeasuresLib.transformCartesianArrayToWGS84Array(polylinePositions),
            );
            labelPosition = endPos;
            if (_lineEntity?.label) {
              // @ts-ignore
              _lineEntity.label.show = false;
            }
            if (optForPoint.label) {
              optForPoint.label.text = labelText;
              optForPoint.label.font = '20px sans-serif';
            }
            if (optForPoint?.id) {
              const newIdArr: string[] = optForPoint.id.split('-');
              newIdArr[newIdArr.length - 1] = `${Math.ceil(Math.random() * 1000000)}`;
              optForPoint.id = newIdArr.join('-');
            }
            const _lastPointEntity: Cesium.Entity | undefined = this.setPointEntity(
              endPos,
              optForPoint,
            );
            if (_lastPointEntity === undefined) return;
            if (optForPoint?.toolName) {
              // @ts-ignore
              _lastPointEntity.toolName = optForPoint.toolName;
            }

            this.temporalEntitiesList.update((arr) => [...arr, _lastPointEntity]);
            this.pushGroupFromTemporal(groupIdChank, optForPoint?.toolName);
            this.clearTemporalEntitiesList(groupIdChank);
            this._viewer.measure?.drawLayer.entities.add(_lastPointEntity);
            this.$viewerService.setPickedEntity(_lineEntity);
          }
          this.measuresBlocker.set(false);
          if (options?.callback && typeof options.callback === 'function') {
            options.callback();
          }
          setTimeout(() => {
            if (this.lineMeasureHasStarted() === true) this.lineMeasureHasStarted.set(false);
          }, 500);
          if (options.reuse === true) this.drawLineMeasureGraphics(options);
        } catch (error: unknown) {
          this.cancelTool();
          if (this.lineMeasureHasStarted() === true) this.lineMeasureHasStarted.set(false);
          console.log(chalk.red(error));
        }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

      return true;
    } catch (error: unknown) {
      this.cancelTool();
      if (this.lineMeasureHasStarted() === true) this.lineMeasureHasStarted.set(false);
      console.log(chalk.red(error));
      return false;
    }
  }

  // ------------------------------------------------- Блок построения прямоугольной площади -------------------------------------- //

  // ------------------------------------------------------------------------------------------------------------------------------ //
  // ------------------------------------------------------------------------------------------------------------------------------ //

  // --------------------------------------------- Блок инструментов удаления сущностей сервиса ------------------------------------ //

  // Main-функция инструмента erase-entity.ts
  public entitiesCleaning(options: MeasureOptions = {}): boolean {
    try {
      if (this.measuresBlocker() === true) return false;
      this.clearHandler();
      this.measuresBlocker.set(true);
      this.$viewerService.onEntityPickingBlock();
      this.handler.set(new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas));
      // @ts-ignore
      this.handler()._initializer = 'erase-entity';
      this.handler()?.setInputAction(
        (cartesian2PositionFromClick: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
          try {
            let entity: Cesium.Entity | undefined = undefined;
            if (!this.$deviceService.isMobile) {
              entity = this.$viewerService.pickEntityByClickOnScene(
                cartesian2PositionFromClick.position,
              );
            } else {
              entity = this.$viewerService.pickEntityByClickOnScene(
                new Cesium.Cartesian2(
                  this.$viewerService.viewer?.scene?.canvas.scrollWidth / 2,
                  this.$viewerService.viewer?.scene?.canvas.scrollHeight / 2,
                ),
              );
            }
            let isRemove: boolean = false;
            if (entity?.id) {
              const listsArr: Array<WritableSignal<Array<EntitiesGroup | undefined>>> =
                Object.values(this.allEntitiesListsLinks);
              // @ts-ignore
              if (!entity?.toolName || this.allEntitiesListsLinks[entity.toolName as ToolName]) {
                // Самое объемное хранилище перемещаем в конец последующего перебора
                const index = listsArr.findIndex((item) => item === this.routeEntityList);
                if (index !== -1 && index !== listsArr.length - 1) {
                  const movedItem = listsArr.splice(index, 1);
                  listsArr.push(...movedItem);
                }
              }
              const newIdArr: string[] = entity.id.split('-'); // у обособленных примитивов id может быть простым рандомным числом (`${Math.ceil(Math.random() * 1000000)}`)
              if (newIdArr.length > 1) {
                const groupId = newIdArr[0];
                // @ts-ignore
                if (entity?.toolName && this.allEntitiesListsLinks[entity.toolName as ToolName]) {
                  isRemove = this.removeEntitiesByGroupId(
                    groupId,
                    // @ts-ignore
                    this.allEntitiesListsLinks[entity.toolName],
                  );
                } else {
                  isRemove = this.removeEntitiesByGroupId(groupId, this.overEntitiesList);
                  for (const entitiesList of listsArr) {
                    // Предполагается, что коллекции с групповым id будут размещены только в одном из сторов
                    if (!isRemove) isRemove = this.removeEntitiesByGroupId(groupId, entitiesList);
                  }
                }
              } else {
                isRemove = this.removeOneEntityById(entity.id, this.overEntitiesList);
                for (const entitiesList of listsArr) {
                  if (!isRemove) isRemove = this.removeOneEntityById(entity.id, entitiesList);
                }
              }
            }
            this.measuresBlocker.set(false);
            this.$viewerService.offEntityPickingBlock();
            if (options.reuse === true) this.entitiesCleaning(options);
            return isRemove;
          } catch (error: unknown) {
            this.cancelTool();
            console.log(chalk.red(error));
            return false;
          }
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK,
      );
      return true;
    } catch (error: unknown) {
      this.cancelTool();
      console.log(chalk.red(error));
      return false;
    }
  }

  // Очистка конкретных групп сущностей (результата одного сценария использования инструмента) с холста и из стора
  public removeEntitiesByGroupId(
    groupId: string,
    entitiesGroups: WritableSignal<Array<EntitiesGroup | undefined>>,
    dataSourceName: string = 'measureLayer',
  ): boolean {
    try {
      if (!entitiesGroups().length) return false;
      // Массив id для последующего удаления из dataSource
      const idsArr: string[] = [];
      // cloneDeep(entitiesGroups()); - очень затратно
      // Массив с индексами - для единственного изменения реактивного entitiesList() (заместо многократных изменений в цикле)
      const indexesArr: number[] = []; // индексы соответствует удаляемым группам сущностей в entitiesList()
      for (let i = 0; i < entitiesGroups().length; i++) {
        if (entitiesGroups()[i]?.groupId.startsWith(groupId)) {
          indexesArr.push(i);
          if (entitiesGroups()[i]?.entitiesList.length) {
            for (const entity of entitiesGroups()[i]!.entitiesList) {
              idsArr.push(entity!.id);
            }
          }
        }
      }
      if (idsArr.length) {
        entitiesGroups.set(entitiesGroups().filter((_, index) => !indexesArr.includes(index)));
      } else {
        console.log(
          chalk.blue(
            "Entities to delete haven't found in entitiesList (by removeEntitiesByGroupId fn)",
          ),
        );
        return false;
      }
      const dataSource: Cesium.DataSource | undefined = this?._viewer.dataSources?.getByName(
        `${dataSourceName}`,
      )?.[0];
      if (dataSource) {
        for (const id of idsArr) {
          dataSource.entities.removeById(id);
        }
      } else {
        console.log(chalk.blue('dataSource is undefined (by removeEntitiesByGroupId fn)'));
        return false;
      }
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  // Очистка одной сущности с холста и из стора
  public removeOneEntityById(
    entityId: string,
    entitiesGroups: WritableSignal<Array<EntitiesGroup | undefined>>,
    dataSourceName: string = 'measureLayer',
  ): boolean {
    try {
      if (!entitiesGroups().length) return false;
      const index: number = entitiesGroups().findIndex((item) => item?.groupId === entityId);
      if (index !== -1) {
        entitiesGroups.update((arr) => {
          arr.splice(index, 1);
          return [...arr];
        });
      } else {
        console.log(
          chalk.blue("entityId hasn't found in entitiesGroups (by removeOneEntityById fn)"),
        );
        return false;
      }
      const dataSource: Cesium.DataSource | undefined = this?._viewer.dataSources?.getByName(
        `${dataSourceName}`,
      )?.[0];
      if (dataSource) {
        return dataSource.entities.removeById(entityId);
      } else {
        console.log(chalk.blue('dataSource is undefined (by removeOneEntityById fn)'));
        return false;
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  //------------------------------------------------------------ //

  // Очистка всех сущностей определенного инструмента (по СКМ на кнопках) с холста и из стора
  public allToolEntitiesCleaning(
    toolName: ToolName,
    dataSourceName: string = 'measureLayer',
  ): boolean {
    try {
      if (!toolName) throw new Error('toolName is undefined in allToolEntitiesCleaning fn');
      if (!this.allEntitiesListsLinks[toolName])
        throw new Error('targetStore is undefined in allToolEntitiesCleaning fn');
      const targetStore: WritableSignal<Array<EntitiesGroup | undefined>> =
        this.allEntitiesListsLinks[toolName];
      if (!targetStore().length) {
        console.log(chalk.blue('targetStore is already empty (by allToolEntitiesCleaning fn)'));
        return false;
      }
      const idsArr: string[] = [];
      for (const item of targetStore()) {
        if (item?.entitiesList.length) {
          for (const entity of item.entitiesList) {
            idsArr.push(entity!.id);
          }
        }
      }
      if (idsArr.length) {
        targetStore.update(() => []);
      } else {
        console.log(chalk.blue('Nothing to erase in targetStore (by allToolEntitiesCleaning fn)'));
        return false;
      }
      const dataSource: Cesium.DataSource | undefined = this?._viewer.dataSources?.getByName(
        `${dataSourceName}`,
      )?.[0];
      if (dataSource) {
        for (const id of idsArr) {
          dataSource.entities.removeById(id);
        }
      } else {
        console.log(chalk.blue('dataSource is undefined (by allToolEntitiesCleaning fn)'));
        return false;
      }
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  // Функция отменяющая результаты выполнения неоконченного сценария работы инструмента (по Esc)
  public removeTemporalEntities(
    groupId?: string,
    dataSourceName: string = 'measureLayer',
  ): boolean {
    try {
      if (!this.temporalEntitiesList().length) return false;
      const idsArr: string[] = [];
      if (groupId) {
        for (const entity of this.temporalEntitiesList()) {
          if (entity?.id.startsWith(groupId)) idsArr.push(entity.id);
        }
      } else {
        for (const entity of this.temporalEntitiesList()) {
          idsArr.push(entity!.id);
        }
      }
      const hasDeletedFromStore = this.clearTemporalEntitiesList(groupId);
      if (hasDeletedFromStore) {
        const dataSource: Cesium.DataSource | undefined = this?._viewer.dataSources?.getByName(
          `${dataSourceName}`,
        )?.[0];
        if (dataSource) {
          for (const id of idsArr) {
            dataSource.entities.removeById(id);
          }
          return true;
        } else {
          console.log(chalk.blue('dataSource is undefined (by removeTemporalEntities fn)'));
          return false;
        }
      } else {
        console.log(
          chalk.blue('Temporal store clearing has failed (by removeTemporalEntities fn)'),
        );
        return false;
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  //------------------------------------------------------------ //

  // Массовая очистка холста (от всех сущностей в конкретном dataSource)
  // Main-функция инструмента clear-measurements.ts
  public clearMeasuresDataSource(): boolean {
    try {
      const dataSource: Cesium.DataSource | undefined =
        this?._viewer.dataSources?.getByName('measureLayer')?.[0];
      if (dataSource) {
        dataSource.entities.removeAll();
      } else {
        console.log(chalk.blue('dataSource is undefined (by clearMeasuresDataSource fn)'));
        return false;
      }
      const listsArr: Array<WritableSignal<Array<EntitiesGroup | undefined>>> = Object.values(
        this.allEntitiesListsLinks,
      );
      listsArr.forEach((item) => {
        if (item !== this.routeEntityList) item.update(() => []);
      });
      return true;
    } catch (error) {
      console.log(chalk.red(error));
      return false;
    }
  }

  public clearRouteDataSources(): boolean {
    try {
      const dataSource: Cesium.DataSource | undefined =
        this?._viewer.dataSources?.getByName('measureRoute')?.[0];
      if (dataSource) {
        dataSource.entities.removeAll();
      } else {
        console.log(chalk.blue('dataSource is undefined (by clearRouteDataSources fn)'));
        return false;
      }
      this.routeEntityList.update(() => []);
      return true;
    } catch (error) {
      console.log(chalk.red(error));
      return false;
    }
  }

  // ------------------------------------------------- Блок вспомогательных функций ----------------------------------------------- //

  // Дубль из measure.service.ts - для автономности (используется инструментами данного сервиса)
  public async getPositionCoordsDescription(
    cartesian: Cesium.Cartesian3 | undefined,
    selectedCrs: CRS,
  ): Promise<{
    latitudeDescription: string;
    longitudeDescription: string;
    heightDescription: string;
    coordsDescription: string;
  }> {
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
    const height = await this.$viewerService.getHeight(cartographic);
    // Используем полученные данные для пересчета в текущую систему координат
    const tCrsCoord = CoordSystems.fromCartographic(
      selectedCrs,
      {
        latitude: latitude,
        longitude: longitude,
        height: height,
      },
      '',
    );
    // Обновляем описание координат
    // Для компонента mouse-coords-info
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
  }

  //------------------------------------------------------------ //
}
