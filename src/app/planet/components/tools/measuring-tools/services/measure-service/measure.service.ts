import { computed, effect, Injectable, signal, untracked, WritableSignal } from '@angular/core';
import * as Cesium from 'cesium';
import chalk from 'chalk';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import type {
  ToolOptions,
  EntitiesGroup,
} from '@/components/tools/services/tools-service/tools.service';

// ------------------------------------------------------------- Блок замечаний --------------------------------------------------- //

// Все методы изначально взяты из общей реализации инструментов (безотносительно принадлежности).
// После инкапсуляции в measuring tools некоторые стандартные методы содержат избыточную логику.
// TODO: будет нужен рефакторинг таких методов после окончательного утверждения бизнес-требований к данному типу инструментов.

// ----------------------------------------------------------- Блок для типизации ------------------------------------------------- //

export interface MeasureOptions extends ToolOptions {
  toolName?: MeasuringToolName; // global important!
}

// Пополнять при добавлении новых инструментов (ТОЛЬКО ДЛЯ ИНСТРУМЕНТОВ, ДОБАВЛЯЮЩИХ СУЩНОСТИ В МЕСТНЫЕ СТОРЫ)
export const measuringToolsNames = Object.freeze([
  'linearMeasurements',
  'rectangleAreaMeasurements',
  'circleAreaMeasurements',
  'polygonalAreaMeasurements',
] as const);
export type MeasuringToolName = (typeof measuringToolsNames)[number];

export function getRusMeasuringToolName(toolName: MeasuringToolName | string) {
  switch (toolName) {
    case 'linearMeasurements':
      return 'Дистанция';
    case 'rectangleAreaMeasurements':
      return 'Прямоугольная площадь';
    case 'circleAreaMeasurements':
      return 'Площадь окружности';
    case 'polygonalAreaMeasurements':
      return 'Площадь многоугольника';
    // case 'newTool':
    //   return 'Новый инструмент';
    default:
      return toolName;
  }
}
// ---------------------------------------------------------- Блок базовых установок ---------------------------------------------- //
// Запровайден в planet.ts
@Injectable()
export class MeasureService {
  constructor(
    private $viewerService: ViewerService,
    private $toolsService: ToolsService,
  ) {
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
              [],
            );
          }
          if (this._linearMesurmentsLinesList()?.length)
            this.$toolsService.switchClampingToGroudForOneStoreEntities(
              this._linearMesurmentsLinesList,
              onFlag,
            );
          if (this._rectangleAreaMesurmentsList()?.length)
            this.$toolsService.switchClampingToGroudForOneStoreEntities(
              this._rectangleAreaMesurmentsList,
              onFlag,
            );
          if (this._circleAreaMeasurementsList()?.length)
            this.$toolsService.switchClampingToGroudForOneStoreEntities(
              this._circleAreaMeasurementsList,
              onFlag,
            );
          if (this._polygonalAreaMeasurementsList()?.length)
            this.$toolsService.switchClampingToGroudForOneStoreEntities(
              this._polygonalAreaMeasurementsList,
              onFlag,
            );
        });
      } catch (error: unknown) {
        console.log(chalk.red(error));
      }
    });
  }

  public cancelMeasuringTool(): void {
    try {
      this.removeTemporalEntities();
      this.$toolsService.clearCommonHandler();
    } catch (error: unknown) {
      throw error;
    }
  }
  // -------------------------------------------------- Блок размещения сторов инструментов --------------------------------------- //

  // Реактивные массивы сущностей, созданных инструментами работы с картой. Также используются в плавающих окнах таких инструментов.
  // Используются для управления компонентами инструментов работы с картой и их плавающими окнами
  private _linearMesurmentsLinesList = signal<Array<EntitiesGroup | undefined>>([]);
  get linearMeasurmentsLinesList() {
    return this._linearMesurmentsLinesList;
  }
  public readonly isLines = computed<boolean>(() => !!this._linearMesurmentsLinesList().length);

  private _rectangleAreaMesurmentsList = signal<Array<EntitiesGroup | undefined>>([]);
  get rectangleAreaMeasurmentsList() {
    return this._rectangleAreaMesurmentsList;
  }
  public readonly isRectangles = computed<boolean>(
    () => !!this._rectangleAreaMesurmentsList().length,
  );

  private _circleAreaMeasurementsList = signal<Array<EntitiesGroup | undefined>>([]);
  get circleAreaMeasurementsList() {
    return this._circleAreaMeasurementsList;
  }
  public readonly isCircles = computed<boolean>(() => !!this._circleAreaMeasurementsList().length);

  private _polygonalAreaMeasurementsList = signal<Array<EntitiesGroup | undefined>>([]);
  get polygonalAreaMeasurementsList() {
    return this._polygonalAreaMeasurementsList;
  }
  public readonly isPoligons = computed<boolean>(
    () => !!this._polygonalAreaMeasurementsList().length,
  );

  private _allEntitiesListsLinks: {
    [P in MeasuringToolName]: WritableSignal<Array<EntitiesGroup | undefined>>;
  } = {
    // prettier-ignore
    'linearMeasurements': this._linearMesurmentsLinesList,
    // prettier-ignore
    'rectangleAreaMeasurements': this._rectangleAreaMesurmentsList,
    // prettier-ignore
    'circleAreaMeasurements': this._circleAreaMeasurementsList,
    // prettier-ignore
    'polygonalAreaMeasurements': this._polygonalAreaMeasurementsList,
    // ...другие сторы
  };
  get allEntitiesListsLinks() {
    return this._allEntitiesListsLinks;
  }

  public _temporalEntitiesList = signal<Array<Cesium.Entity | undefined>>([]); // хранилище для инструментов в процессе построения (БЕЗ ГРУППИРОВКИ)
  get temporalEntitiesList() {
    return this._temporalEntitiesList;
  }

  // ---------------------------------------------- Блок управления основными сторами инструментов -------------------------------- //

  // Очистка конкретных групп сущностей (результата одного сценария использования инструмента) с холста и из стора
  public removeEntitiesByGroupId(
    groupId: string | undefined,
    entitiesStore: WritableSignal<Array<EntitiesGroup | undefined>>,
    dataSourceName: string = this.$toolsService.measuringToolsLayerName,
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
  public removeOneEntityByGroupId(
    entityId: string,
    entitiesStore: WritableSignal<Array<EntitiesGroup | undefined>>,
    dataSourceName: string = this.$toolsService.measuringToolsLayerName,
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
    toolName: MeasuringToolName | string,
    dataSourceName: string = this.$toolsService.measuringToolsLayerName,
  ): boolean {
    try {
      if (!toolName) throw new Error('toolName is undefined in allToolEntitiesCleaning fn');
      if (!measuringToolsNames.includes(toolName as any)) return true;
      if (!this._allEntitiesListsLinks[toolName as MeasuringToolName])
        throw new Error('targetStore is undefined in allToolEntitiesCleaning fn');
      const targetStore: WritableSignal<Array<EntitiesGroup | undefined>> =
        this._allEntitiesListsLinks[toolName as MeasuringToolName];
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
        this?.$viewerService.viewer.dataSources?.getByName(`${dataSourceName}`)?.[0];
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

  //------------------------------------------------------------ //

  // Массовая очистка холста (от всех сущностей в конкретном dataSource)
  public clearMeasuresDataSource(): boolean {
    try {
      const dataSource: Cesium.DataSource | undefined =
        this?.$viewerService.viewer.dataSources?.getByName(
          this.$toolsService.measuringToolsLayerName,
        )?.[0];
      if (dataSource) {
        dataSource.entities.removeAll();
      } else {
        console.log(chalk.blue('dataSource is undefined (by clearMeasuresDataSource fn)'));
        return false;
      }
      const listsArr: Array<WritableSignal<Array<EntitiesGroup | undefined>>> = Object.values(
        this._allEntitiesListsLinks,
      );
      listsArr.forEach((item) => {
        item.update(() => []);
      });
      return true;
    } catch (error) {
      console.log(chalk.red(error));
      return false;
    }
  }

  //------------------------------------------------------------ //

  public changeDefaultEntityInGroup(
    groupIdChank: string,
    defaultEntity: Cesium.Entity | undefined,
    toolName: MeasuringToolName,
  ): boolean {
    try {
      const targetList: WritableSignal<Array<EntitiesGroup | undefined>> =
        this._allEntitiesListsLinks[toolName];
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
    toolName: MeasuringToolName | undefined,
    defaultEntity?: Cesium.Entity,
  ): boolean {
    try {
      if (toolName === undefined) {
        console.log(chalk.blue('toolName is undefined in pushGroupFromTemporal fn'));
        return false;
      }
      const targetList: WritableSignal<Array<EntitiesGroup | undefined>> =
        this._allEntitiesListsLinks[toolName];
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
    toolName: MeasuringToolName | undefined,
    defaultEntity?: Cesium.Entity,
  ): boolean {
    try {
      if (toolName === undefined) {
        console.log(chalk.blue('toolName is undefined in pushGroupWithoutTemporal fn'));
        return false;
      }
      if (!entities.length) throw new Error('None entities in pushGroupWithoutTemporal fn');
      const targetList: WritableSignal<Array<EntitiesGroup | undefined>> =
        this._allEntitiesListsLinks[toolName];
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
    toolName: MeasuringToolName | undefined,
    defaultEntity?: Cesium.Entity,
  ): boolean {
    try {
      if (toolName === undefined) {
        console.log(chalk.blue('toolName is undefined in pushGroupWithoutTemporalWithDrawing fn'));
        return false;
      }
      if (!entities.length) throw new Error('None entities in pushGroupWithoutTemporal fn');
      if (this.pushGroupWithoutTemporal(entities, groupIdChank, toolName, defaultEntity) === true) {
        for (const entity of entities) {
          this.addNewEntityToMeasureLayer(entity!);
        }
        return true;
      } else return false;
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
    dataSourceName: string = this.$toolsService.measuringToolsLayerName,
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

  public addNewEntityToMeasureLayer(entity: Cesium.Entity): boolean {
    try {
      if (!entity || !(entity instanceof Cesium.Entity)) {
        console.log(chalk.red('Invalid entity in addNewEntityToMeasureLayer fn'));
        return false;
      }
      const dataSource: Cesium.DataSource | undefined =
        this?.$viewerService.viewer.dataSources?.getByName(
          this.$toolsService.measuringToolsLayerName,
        )?.[0];
      if (dataSource) {
        dataSource.entities.add(entity);
        return true;
      } else {
        console.log(chalk.red("Data source hasn't found in addNewEntityToMeasureLayer fn"));
        return false;
      }
    } catch (error: unknown) {
      throw error;
    }
  }

  // ------------------------------------------------ Блок изменений параметров сущностей ----------------------------------------- //

  // Замена лисенеров (Cesium.CallbackProperty) на константы (для экономии производительности)
  // В настоящий момент не используется за ненадобностью, т.к. сценарии использования измерительных инструментов не плодят сущности на карте (в отличие от инструментов рисования)
  // private setEntityConstantsTimeouts: { [entityId: string]: number } = {};
  // public setEntityConstants(validId: string | undefined): void {
  //   try {
  //     const entityId = validId; // контрольная копия
  //     if (!entityId || typeof entityId !== 'string') {
  //       throw new Error("Invalid entity's ID in setEntityConstants fn");
  //     }
  //     if (this.setEntityConstantsTimeouts?.[entityId]) {
  //       clearTimeout(this.setEntityConstantsTimeouts[entityId]);
  //     }
  //     const toolName: string = entityId.split('-')[1];
  //     if (measuringToolsNames.includes(toolName as MeasuringToolName)) {
  //       this.setEntityConstantsTimeouts[entityId] = setTimeout(
  //         (id: string) => {
  //           this.$toolsService.setConstantsForStoreEntities(
  //             this.allEntitiesListsLinks[toolName as MeasuringToolName],
  //             id,
  //           );
  //         },
  //         this.$toolsService.setEntityConstantsTimer,
  //         entityId, // закрепление контекста
  //       );
  //     } else throw new Error("Invalid entity's tool's name in setEntityConstants fn");
  //   } catch (error: unknown) {
  //     throw error;
  //   }
  // }
}
