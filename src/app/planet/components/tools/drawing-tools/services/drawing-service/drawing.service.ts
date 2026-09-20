import { computed, effect, Injectable, signal, untracked, WritableSignal } from '@angular/core';
import * as Cesium from 'cesium';
import chalk from 'chalk';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import type { DataSourceName } from '@/components/tools/services/tools-service/tools.service';
import type {
  ToolOptions,
  EntitiesGroup,
} from '@/components/tools/services/tools-service/tools.service';

// ------------------------------------------------------------- Блок замечаний --------------------------------------------------- //

// ----------------------------------------------------------- Блок для типизации ------------------------------------------------- //

export interface DrawingOptions extends ToolOptions {
  toolName?: DrawingToolName; // global important!
}

// Пополнять при добавлении новых инструментов (ТОЛЬКО ДЛЯ ИНСТРУМЕНТОВ, ДОБАВЛЯЮЩИХ СУЩНОСТИ В МЕСТНЫЕ СТОРЫ)
export const drawingToolsNames = Object.freeze([
  'drawMark',
  'drawLine',
  'drawRectangle',
  'drawCircle',
  'drawPolygon',
] as const);
export type DrawingToolName = (typeof drawingToolsNames)[number];

// Пополнять при добавлении новых инструментов (ТОЛЬКО ДЛЯ ИНСТРУМЕНТОВ, ДОБАВЛЯЮЩИХ СУЩНОСТИ В МЕСТНЫЕ СТОРЫ)
export function getRusDrawingToolName(toolName: DrawingToolName | string) {
  switch (toolName) {
    case 'drawMark':
      return 'Метка';
    case 'drawLine':
      return 'Линия';
    case 'drawRectangle':
      return 'Прямоугольник';
    case 'drawCircle':
      return 'Окружность';
    case 'drawPolygon':
      return 'Многоугольник';
    // case 'newTool':
    //   return 'Новый инструмент';
    default:
      return toolName;
  }
}

export const drawingToolsNamesRus = Object.freeze([
  getRusDrawingToolName('drawMark'),
  getRusDrawingToolName('drawLine'),
  getRusDrawingToolName('drawRectangle'),
  getRusDrawingToolName('drawCircle'),
  getRusDrawingToolName('drawPolygon'),
] as const);
export type DrawingToolNameRus = (typeof drawingToolsNamesRus)[number];
// Пополнять при добавлении новых инструментов (ТОЛЬКО ДЛЯ ИНСТРУМЕНТОВ, ДОБАВЛЯЮЩИХ СУЩНОСТИ В МЕСТНЫЕ СТОРЫ)
export function getOriginDrawingToolName(toolNameRus: DrawingToolNameRus | string) {
  switch (toolNameRus) {
    case getRusDrawingToolName('drawMark'):
      return 'drawMark';
    case getRusDrawingToolName('drawLine'):
      return 'drawLine';
    case getRusDrawingToolName('drawRectangle'):
      return 'drawRectangle';
    case getRusDrawingToolName('drawCircle'):
      return 'drawCircle';
    case getRusDrawingToolName('drawPolygon'):
      return 'drawPolygon';
    default:
      return toolNameRus;
  }
}

// ---------------------------------------------------------- Блок базовых установок ---------------------------------------------- //
// Запровайден в planet.ts
@Injectable()
export class DrawingService {
  declare public findEntityPathInStore;
  declare public readonly drawingToolsLayerName: DataSourceName;
  declare public readonly drawRouteLayerName: DataSourceName;

  constructor(
    private $viewerService: ViewerService,
    private $toolsService: ToolsService,
  ) {
    this.findEntityPathInStore = this.$toolsService.findEntityPathInStore;
    this.drawingToolsLayerName = this.$toolsService.drawingToolsLayerName;
    this.drawRouteLayerName = this.$toolsService.drawRouteLayerName;
    // Автоматическое переключение прилипания компонентов сущностей к рельефу в зависимости от this.$viewerService.viewer.scene.mode
    effect(() => {
      try {
        let onFlag: boolean = true;
        if (
          this.$viewerService.nowSceneModeDescription() === '2D' ||
          this.$viewerService.nowSceneModeDescription() === 'Columbus'
        )
          onFlag = false;
        else onFlag = true;
        untracked(() => {
          if (this._temporalEntitiesList()?.length) {
            this.$toolsService.switchClampingToGroudForTemporalEntities(
              this._temporalEntitiesList,
              onFlag,
              ['vectorPolygons', 'addAnnotation', 'addPhoto', 'addDome', 'heatmap'],
            );
          }
          if (this._drawMarkEntitiesList()?.length)
            this.$toolsService.switchClampingToGroudForOneStoreEntities(
              this._drawMarkEntitiesList,
              onFlag,
            );
          if (this._drawLineEntitiesList()?.length)
            this.$toolsService.switchClampingToGroudForOneStoreEntities(
              this._drawLineEntitiesList,
              onFlag,
            );
          if (this._drawRectangleEntitiesList()?.length)
            this.$toolsService.switchClampingToGroudForOneStoreEntities(
              this._drawRectangleEntitiesList,
              onFlag,
            );
          if (this._drawCircleEntitiesList()?.length)
            this.$toolsService.switchClampingToGroudForOneStoreEntities(
              this._drawCircleEntitiesList,
              onFlag,
            );
          if (this._drawPolygonEntitiesList()?.length)
            this.$toolsService.switchClampingToGroudForOneStoreEntities(
              this._drawPolygonEntitiesList,
              onFlag,
            );
          if (this._routeEntityList()?.length)
            this.$toolsService.switchClampingToGroudForOneStoreEntities(
              this._routeEntityList,
              onFlag,
            );
        });
      } catch (error: unknown) {
        console.log(chalk.red(error));
      }
    });
  }

  public cancelDrawingTool(): void {
    try {
      this.removeTemporalEntities();
      this.$toolsService.clearCommonHandler();
    } catch (error: unknown) {
      throw error;
    }
  }

  // -------------------------------------------------- Блок размещения сторов инструментов --------------------------------------- //

  // Реактивные массивы сущностей, созданных инструментами работы с картой. Также используются в плавающих окнах таких инструментов и в списке нанесенных сущностей в ппанели.
  private _drawMarkEntitiesList = signal<Array<EntitiesGroup | undefined>>([]);
  get drawMarkEntitiesList() {
    return this._drawMarkEntitiesList;
  }
  public readonly isMarks = computed<boolean>(() => !!this._drawMarkEntitiesList().length);

  private _drawLineEntitiesList = signal<Array<EntitiesGroup | undefined>>([]);
  get drawLineEntitiesList() {
    return this._drawLineEntitiesList;
  }
  public readonly isLines = computed<boolean>(() => !!this._drawLineEntitiesList().length);

  private _drawRectangleEntitiesList = signal<Array<EntitiesGroup | undefined>>([]);
  get drawRectangleEntitiesList() {
    return this._drawRectangleEntitiesList;
  }
  public readonly isRectangles = computed<boolean>(() => !!this._drawRectangleEntitiesList().length);

  private _drawCircleEntitiesList = signal<Array<EntitiesGroup | undefined>>([]);
  get drawCircleEntitiesList() {
    return this._drawCircleEntitiesList;
  }
  public readonly isCircles = computed<boolean>(() => !!this._drawCircleEntitiesList().length);

  private _drawPolygonEntitiesList = signal<Array<EntitiesGroup | undefined>>([]);
  get drawPolygonEntitiesList() {
    return this._drawPolygonEntitiesList;
  }
  public readonly isPoligons = computed<boolean>(() => !!this._drawPolygonEntitiesList().length);

  private _vectorPolygonsList = signal<Array<EntitiesGroup | undefined>>([]);
  get vectorPolygonsList() {
    return this._vectorPolygonsList;
  }
  public readonly isVectorPolygons = computed<boolean>(() => !!this._vectorPolygonsList().length);

  private _annotationsList = signal<Array<EntitiesGroup | undefined>>([]);
  get annotationsList() {
    return this._annotationsList;
  }
  public readonly isAnnotations = computed<boolean>(() => !!this._annotationsList().length);

  private _photosList = signal<Array<EntitiesGroup | undefined>>([]);
  get photosList() {
    return this._photosList;
  }
  public readonly isPhotos = computed<boolean>(() => !!this._photosList().length);

  private _addDomeEntitiesList = signal<Array<EntitiesGroup | undefined>>([]);
  get addDomeEntitiesList() {
    return this._addDomeEntitiesList;
  }
  public readonly isDomes = computed<boolean>(() => !!this._addDomeEntitiesList().length);

  private _heatmapList = signal<Array<EntitiesGroup | undefined>>([]);
  get heatmapList() {
    return this._heatmapList;
  }
  public readonly isHeatmap = computed<boolean>(() => !!this._addDomeEntitiesList().length);

  // ...другие сторы
  // НЕ ЗАБЫВАТЬ ДОБАВЛЯТЬ флаг типа "isEntities" в entity-rubber.service.ts в Signal "storesAreEmpty" НОВЫЕ ИНСТРУМЕНТЫ с удаляемыми с холста сущностями

  private _routeEntityList = signal<Array<EntitiesGroup | undefined>>([]); // хранилище для большого количества сущностей специфичного инструмента
  get routeEntityList() {
    return this._routeEntityList;
  }
  public readonly isRoutes = computed<boolean>(() => !!this._routeEntityList().length);

  // private _compassList = signal<Array<EntitiesGroup | undefined>>([]);
  // get compassList() {
  //   return this._compassList;
  // }
  // public readonly isCompass = computed<boolean>(() => !!this._compassList().length);

  private _allEntitiesListsLinks: {
    [P in DrawingToolName]: WritableSignal<Array<EntitiesGroup | undefined>>;
  } = {
    // prettier-ignore
    'drawMark': this._drawMarkEntitiesList,
    // prettier-ignore
    'drawLine': this._drawLineEntitiesList,
    // prettier-ignore
    'drawRectangle': this._drawRectangleEntitiesList,
    // prettier-ignore
    'drawCircle': this._drawCircleEntitiesList,
    // prettier-ignore
    'drawPolygon': this._drawPolygonEntitiesList,

    // ...другие сторы
  };
  get allEntitiesListsLinks() {
    return this._allEntitiesListsLinks;
  }

  private _overEntitiesList = signal<Array<EntitiesGroup | undefined>>([]); // резервное хранилище для инструментов (вне состава _allEntitiesListsLinks)
  get overEntitiesList() {
    return this._overEntitiesList;
  }
  public readonly isOver = computed<boolean>(() => !!this._overEntitiesList().length);

  public _temporalEntitiesList = signal<Array<Cesium.Entity | undefined>>([]); // хранилище для инструментов в процессе построения (БЕЗ ГРУППИРОВКИ)
  get temporalEntitiesList() {
    return this._temporalEntitiesList;
  }

  // ---------------------------------------------- Блок управления основными сторами инструментов -------------------------------- //

  // Очистка конкретных групп сущностей (результата одного сценария использования инструмента) с холста и из стора
  public removeEntitiesByGroupId(
    groupId: string | undefined,
    entitiesStore: WritableSignal<Array<EntitiesGroup | undefined>>,
    dataSourceName: string = this.drawingToolsLayerName,
  ): boolean {
    try {
      if (!entitiesStore().length) return false;
      if (groupId === undefined) {
        console.log(
          chalk.blue('Entities group to delete is not defined (by removeEntitiesByGroupId fn)'),
        );
        return false;
      }
      // Массив id для последующего удаления из dataSource
      const idsArr: string[] = [];
      const entitiesGroupIndex = entitiesStore().findIndex((groupObj) =>
        groupObj?.groupId.startsWith(groupId),
      );
      if (entitiesGroupIndex !== -1 && entitiesStore()[entitiesGroupIndex]?.entitiesList) {
        for (const entity of entitiesStore()[entitiesGroupIndex]!.entitiesList) {
          idsArr.push(entity!.id);
        }
        entitiesStore.update((arr) => {
          arr.splice(entitiesGroupIndex, 1);
          return [...arr];
        });
      } else {
        console.log(
          chalk.blue(
            "Entities group to delete haven't found in entitiesStore (by removeEntitiesByGroupId fn)",
          ),
        );
        return false;
      }
      const dataSource: Cesium.DataSource | undefined =
        this?.$viewerService.viewer.dataSources?.getByName(`${dataSourceName}`)?.[0];
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

  // Очистка одной сущности с холста и из стора (аналогично removeEntitiesByGroupId, но без двух переборов)
  // Только для случая, если entityId === groupId (например для стора _overEntitiesList)
  public removeOneEntityByGroupId(
    entityId: string,
    entitiesStore: WritableSignal<Array<EntitiesGroup | undefined>>,
    dataSourceName: string = this.drawingToolsLayerName,
  ): boolean {
    try {
      if (!entitiesStore().length) return false;
      const entitiesGroupIndex = entitiesStore().findIndex((groupObj) =>
        groupObj?.groupId.startsWith(entityId),
      );
      if (entitiesGroupIndex !== -1 && entitiesStore()[entitiesGroupIndex]?.entitiesList) {
        entitiesStore.update((arr) => {
          arr.splice(entitiesGroupIndex, 1);
          return [...arr];
        });
      } else {
        console.log(
          chalk.blue("Entity Id hasn't found in entitiesStore (by removeOneEntityByGroupId fn)"),
        );
        return false;
      }
      const dataSource: Cesium.DataSource | undefined =
        this?.$viewerService.viewer.dataSources?.getByName(`${dataSourceName}`)?.[0];
      if (dataSource) {
        return dataSource.entities.removeById(entityId);
      } else {
        console.log(chalk.blue('dataSource is undefined (by removeOneEntityByGroupId fn)'));
        return false;
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  //------------------------------------------------------------ //

  // Очистка всех групп сущностей определенного инструмента (например, по СКМ на кнопках) с холста и из стора
  public allToolEntitiesCleaning(
    toolName: DrawingToolName | string,
    dataSourceName: string = this.drawingToolsLayerName,
  ): boolean {
    try {
      if (!toolName) throw new Error('toolName is undefined in allToolEntitiesCleaning fn');
      if (!drawingToolsNames.includes(toolName as any)) return true;
      if (!this._allEntitiesListsLinks[toolName as DrawingToolName])
        throw new Error('targetStore is undefined in allToolEntitiesCleaning fn');
      const targetStore: WritableSignal<Array<EntitiesGroup | undefined>> =
        this._allEntitiesListsLinks[toolName as DrawingToolName];
      if (!targetStore().length) {
        console.log(chalk.blue('targetStore is already empty (by allToolEntitiesCleaning fn)'));
        console.trace();
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
      const dataSource: Cesium.DataSource | undefined =
        this?.$viewerService.viewer.dataSources?.getByName(`${dataSourceName}`)?.[0]; // 'drawLayer' || `drawingRoute`
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

  public allOversEntitiesCleaning(dataSourceName: string = this.drawingToolsLayerName): boolean {
    try {
      const targetStore: WritableSignal<Array<EntitiesGroup | undefined>> = this._overEntitiesList;
      if (!targetStore().length) {
        console.log(chalk.blue('targetStore is already empty (by allOversEntitiesCleaning fn)'));
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
        console.log(chalk.blue('Nothing to erase in targetStore (by allOversEntitiesCleaning fn)'));
        return false;
      }
      const dataSource: Cesium.DataSource | undefined =
        this?.$viewerService.viewer.dataSources?.getByName(`${dataSourceName}`)?.[0];
      if (dataSource) {
        for (const id of idsArr) {
          dataSource.entities.removeById(id);
        }
      } else {
        console.log(chalk.blue('dataSource is undefined (by allOversEntitiesCleaning fn)'));
        return false;
      }
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  //------------------------------------------------------------ //

  // Массовая очистка холста (от всех сущностей в конкретном dataSource)
  public clearDrawingsDataSource(): boolean {
    try {
      const dataSource: Cesium.DataSource | undefined =
        this?.$viewerService.viewer.dataSources?.getByName(this.drawingToolsLayerName)?.[0];
      if (dataSource) {
        dataSource.entities.removeAll();
      } else {
        console.log(chalk.blue('dataSource is undefined (by clearDrawingsDataSource fn)'));
        return false;
      }
      const listsArr: Array<WritableSignal<Array<EntitiesGroup | undefined>>> = Object.values(
        this._allEntitiesListsLinks,
      ).concat(this._overEntitiesList);
      listsArr.forEach((item) => {
        if (item !== this._routeEntityList) item.update(() => []);
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
        this?.$viewerService.viewer.dataSources?.getByName('drawRoute')?.[0];
      if (dataSource) {
        dataSource.entities.removeAll();
      } else {
        console.log(chalk.blue('dataSource is undefined (by clearRouteDataSources fn)'));
        return false;
      }
      this._routeEntityList.update(() => []);
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  //------------------------------------------------------------ //

  public changeDefaultEntityInGroup(
    groupIdChank: string,
    defaultEntity: Cesium.Entity | undefined,
    toolName?: DrawingToolName,
  ): boolean {
    try {
      const targetList: WritableSignal<Array<EntitiesGroup | undefined>> = toolName
        ? this._allEntitiesListsLinks[toolName]
        : this._overEntitiesList;
      const index = targetList().findIndex((item) => item?.groupId === groupIdChank);
      if (index !== -1) {
        targetList.update((arr) => {
          arr[index]!.defaultEntity = defaultEntity || undefined;
          return [...arr];
        });
      } else {
        console.log(chalk.blue("groupId hasn't found in changeDefaultEntityInGroup fn"));
        return false;
      }
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  // ------------------------------------------------- Блок управления временным хранилищем --------------------------------------- //

  public pushGroupFromTemporal(
    groupIdChank: string,
    toolName?: DrawingToolName,
    defaultEntity?: Cesium.Entity,
  ): boolean {
    try {
      const targetList: WritableSignal<Array<EntitiesGroup | undefined>> = toolName
        ? this._allEntitiesListsLinks[toolName]
        : this._overEntitiesList;
      const index = targetList().findIndex((item) => item?.groupId === groupIdChank);
      if (index === -1) {
        targetList.update((arr) => {
          arr.push({
            groupId: groupIdChank,
            entitiesList: this._temporalEntitiesList(),
            defaultEntity: defaultEntity || undefined,
          });
          return [...arr];
        });
      } else {
        targetList.update((arr) => {
          arr[index]?.entitiesList.push(...this._temporalEntitiesList());
          return [...arr];
        });
      }
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  public pushGroupWithoutTemporal(
    entities: Array<Cesium.Entity | undefined>,
    groupIdChank: string,
    toolName?: DrawingToolName,
    defaultEntity?: Cesium.Entity,
  ): boolean {
    try {
      if (!entities.length) throw new Error('None entities in pushGroupWithoutTemporal fn');
      const targetList: WritableSignal<Array<EntitiesGroup | undefined>> = toolName
        ? this._allEntitiesListsLinks[toolName]
        : this._overEntitiesList;
      const index = targetList().findIndex((item) => item?.groupId === groupIdChank);
      if (index === -1) {
        targetList.update((arr) => {
          arr.push({
            groupId: groupIdChank,
            entitiesList: entities,
            defaultEntity: defaultEntity || undefined,
          });
          return [...arr];
        });
      } else {
        targetList.update((arr) => {
          arr[index]?.entitiesList.push(...entities);
          return [...arr];
        });
      }
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  public pushGroupWithoutTemporalWithDrawing(
    entities: Array<Cesium.Entity | undefined>,
    groupIdChank: string,
    toolName?: DrawingToolName,
    defaultEntity?: Cesium.Entity,
  ): boolean {
    try {
      if (!entities || !entities?.length)
        throw new Error('None entities in pushGroupWithoutTemporal fn');
      let validEntities: Array<Cesium.Entity | undefined> = [];
      let layer: Cesium.CustomDataSource | undefined = undefined;
      layer = this.$viewerService.viewer.dataSources?.getByName(this.drawingToolsLayerName)?.[0];
      if (layer !== undefined) {
        for (const entity of entities) {
          if (!entity?.id) continue;
          const index = layer.entities.values.findIndex((item) => item.id === entity.id);
          if (index !== -1) {
            console.log(
              chalk.blue(
                'Entity already exists on draw layer and will be loose (in pushGroupWithoutTemporalWithDrawing fn)',
              ),
            );
            continue;
          }
          validEntities.push(entity);
        }
      } else {
        validEntities = entities;
      }
      if (!validEntities.length) {
        console.log(
          chalk.blue(
            `No valid entities on pushing "${toolName}" entities in store (in pushGroupWithoutTemporalWithDrawing fn)`,
          ),
        );
        return false;
      }
      // console.log(validEntities);
      if (
        this.pushGroupWithoutTemporal(validEntities, groupIdChank, toolName, defaultEntity) === true
      ) {
        for (const entity of validEntities) {
          this.addNewEntityToDrawLayer(entity!);
        }

        return true;
      } else {
        //   console.log(
        //     chalk.red(
        //       `Pushing "${toolName}" entities in store failed in pushGroupWithoutTemporalWithDrawing fn`,
        //     ),
        //   );
        return false;
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  //------------------------------------------------------------ //

  // Очистка временного стора без очистки холста от его сущностей
  public clearTemporalEntitiesList(groupIdChank?: string): boolean {
    try {
      if (this._temporalEntitiesList().length) {
        if (groupIdChank) {
          this._temporalEntitiesList.update((arr) => {
            arr = arr.filter((item) => !item?.id.startsWith(groupIdChank));
            return [...arr];
          });
        } else {
          this._temporalEntitiesList.set([]);
        }
      } else {
        console.log('_temporalEntitiesList() is empty in clearTemporalEntitiesList fn');
      }
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  // Метод, отменяющий результаты выполнения неоконченного сценария работы инструмента (например, по Esc)
  public removeTemporalEntities(
    groupId?: string,
    dataSourceName: string = this.drawingToolsLayerName,
  ): boolean {
    try {
      if (!this._temporalEntitiesList().length) return false;
      const idsArr: string[] = [];
      if (groupId) {
        for (const entity of this._temporalEntitiesList()) {
          if (entity?.id.startsWith(groupId)) idsArr.push(entity.id);
        }
      } else {
        for (const entity of this._temporalEntitiesList()) {
          idsArr.push(entity!.id);
        }
      }
      const hasDeletedFromStore = this.clearTemporalEntitiesList(groupId);
      if (hasDeletedFromStore) {
        const dataSource: Cesium.DataSource | undefined =
          this?.$viewerService.viewer.dataSources?.getByName(`${dataSourceName}`)?.[0];
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

  // -------------------------------------------------- Блок добавления сущности на холст ----------------------------------------- //

  // Для main-функций  инструментов рисования
  public addNewEntityToDrawLayer(entity: Cesium.Entity): boolean {
    try {
      const dataSource: Cesium.DataSource | undefined =
        this?.$viewerService.viewer.dataSources?.getByName(this.drawingToolsLayerName)?.[0];
      if (dataSource) {
        dataSource.entities.add(entity);
        return true;
      } else {
        console.log(chalk.red("Data source hasn't found in addNewEntityToDrawLayer fn"));
        return false;
      }
    } catch (error: unknown) {
      // В данном common-сервисе В PUBLIC-МЕТОДАХ выбрасываются именно ошибка, а не console.log.
      // Обработки таких ошибок необходимы непосредственно в компонентах, его использующих, по причине возможного наличия дополнительной логики отмены сценариев.
      throw error;
    }
  }
  // Для main-функции инструмента "Маршрут"
  public addNewEntityToDrawRoute(entity: Cesium.Entity): boolean {
    try {
      if (!entity || !(entity instanceof Cesium.Entity)) {
        console.log(chalk.red('Invalid entity in addNewEntityToDrawRoute fn'));
        return false;
      }
      const dataSource: Cesium.DataSource | undefined =
        this?.$viewerService.viewer.dataSources?.getByName(
          this.$toolsService.drawRouteLayerName,
        )?.[0];
      if (dataSource) {
        dataSource.entities.add(entity);
        return true;
      } else {
        console.log(chalk.red("Data source hasn't found in addNewEntityToDrawRoute fn"));
        return false;
      }
    } catch (error: unknown) {
      throw error;
    }
  }

  // ------------------------------------------------ Блок изменений параметров сущностей ----------------------------------------- //

  // Замена лисенеров (Cesium.CallbackProperty) на константы (для экономии производительности)
  private setEntityConstantsTimeouts: { [entityId: string]: number } = {};
  public setEntityConstants(validId: string | undefined): void {
    try {
      const entityId = validId; // контрольная копия
      if (!entityId || typeof entityId !== 'string') {
        throw new Error("Invalid entity's ID in setEntityConstants fn");
      }
      if (this.setEntityConstantsTimeouts?.[entityId]) {
        clearTimeout(this.setEntityConstantsTimeouts[entityId]);
      }
      const toolName: string = entityId.split('-')[1];
      if (drawingToolsNames.includes(toolName as DrawingToolName)) {
        this.setEntityConstantsTimeouts[entityId] = setTimeout(
          (id: string) => {
            this.$toolsService.setConstantsForStoreEntities(
              this.allEntitiesListsLinks[toolName as DrawingToolName],
              id,
            );
          },
          this.$toolsService.setEntityConstantsTimer,
          entityId, // закрепление контекста
        );
      } else throw new Error("Invalid entity's tool's name in setEntityConstants fn");
    } catch (error: unknown) {
      throw error;
    }
  }
}
