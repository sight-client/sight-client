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
// На настоящий момент инструменты работы с камерой ("Круговой облет", "Вид из точки") используют только один временный стор ("temporalEntitiesList")
// и не используют плавающие окна (закомменчены импорты в tools-floating-windows.ts).
// Все состояния и методы, связанные с обычными сторами оставлены на будущее, не закомменчены намеренно - для ускоренного восстановления фичи плавающих окон.

// Все методы изначально взяты из общей реализации инструментов (безотносительно принадлежности).
// После инкапсуляции в camera tools некоторые стандартные методы содержат избыточную логику.
// TODO: будет нужен рефакторинг таких методов после окончательного утверждения бизнес-требований к данному типу инструментов.

// ----------------------------------------------------------- Блок для типизации ------------------------------------------------- //

export interface CameraToolsOptions extends ToolOptions {
  toolName?: CameraToolName; // global important!
}

export const cameraToolsNames = Object.freeze(['flyAround', 'pointView'] as const);
export type CameraToolName = (typeof cameraToolsNames)[number];

export function getRusCameraToolName(toolName: CameraToolName | string) {
  switch (toolName) {
    case 'flyAround':
      return 'Круговой облет';
    case 'pointView':
      return 'Вид из точки';
    // case 'newTool':
    //   return 'Новый инструмент';
    default:
      return toolName;
  }
}
// ---------------------------------------------------------- Блок базовых установок ---------------------------------------------- //
// Запровайден в planet.ts
@Injectable()
export class CameraToolsService {
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
              ['pointView'],
            );
          }
          if (this._flyAroundEntitiesList()?.length)
            this.$toolsService.switchClampingToGroudForOneStoreEntities(
              this._flyAroundEntitiesList,
              onFlag,
            );
        });
      } catch (error: unknown) {
        console.log(chalk.red(error));
      }
    });
  }

  public cancelCameraTool(): void {
    try {
      this.removeTemporalEntities();
      // Notice: на этом этапе перестает работать условие для Esc-лисенера (в tools-panel.ts)
      this.$toolsService.clearCommonHandler();
    } catch (error: unknown) {
      throw error;
    }
  }
  // -------------------------------------------------- Блок размещения сторов инструментов --------------------------------------- //

  // Реактивные массивы сущностей, созданных инструментами работы с картой. Также используются в плавающих окнах таких инструментов.
  // Используются для управления компонентами инструментов работы с картой и их плавающими окнами
  private _flyAroundEntitiesList = signal<Array<EntitiesGroup | undefined>>([]);
  get flyAroundEntitiesList() {
    return this._flyAroundEntitiesList;
  }
  public readonly isFlyAroundEntities = computed<boolean>(
    () => !!this._flyAroundEntitiesList().length,
  );

  private _pointViewEntitiesList = signal<Array<EntitiesGroup | undefined>>([]);
  get pointViewEntitiesList() {
    return this._pointViewEntitiesList;
  }
  public readonly isPointViewEntities = computed<boolean>(
    () => !!this._pointViewEntitiesList().length,
  );

  private _allEntitiesListsLinks: {
    [P in CameraToolName]: WritableSignal<Array<EntitiesGroup | undefined>>;
  } = {
    // prettier-ignore
    'flyAround': this._flyAroundEntitiesList,
    // prettier-ignore
    'pointView': this._pointViewEntitiesList,
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
    dataSourceName: string = this.$toolsService.cameraToolsLayerName,
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
    dataSourceName: string = this.$toolsService.cameraToolsLayerName,
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
    toolName: CameraToolName | string,
    dataSourceName: string = this.$toolsService.cameraToolsLayerName,
  ): boolean {
    try {
      if (!toolName) throw new Error('toolName is undefined in allToolEntitiesCleaning fn');
      if (!cameraToolsNames.includes(toolName as any)) return true;
      if (!this._allEntitiesListsLinks[toolName as CameraToolName])
        throw new Error('targetStore is undefined in allToolEntitiesCleaning fn');
      const targetStore: WritableSignal<Array<EntitiesGroup | undefined>> =
        this._allEntitiesListsLinks[toolName as CameraToolName];
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
  public clearCameraToolsDataSource(): boolean {
    try {
      const dataSource: Cesium.DataSource | undefined =
        this?.$viewerService.viewer.dataSources?.getByName(
          this.$toolsService.cameraToolsLayerName,
        )?.[0];
      if (dataSource) {
        dataSource.entities.removeAll();
      } else {
        console.log(chalk.blue('dataSource is undefined (by clearCameraToolsDataSource fn)'));
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
    toolName: CameraToolName,
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
    toolName: CameraToolName | undefined,
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
    toolName: CameraToolName | undefined,
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
    toolName: CameraToolName | undefined,
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
          this.addNewEntityToCameraToolsLayer(entity!);
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
    dataSourceName: string = this.$toolsService.cameraToolsLayerName,
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

  public addNewEntityToCameraToolsLayer(entity: Cesium.Entity): boolean {
    try {
      if (!entity || !(entity instanceof Cesium.Entity)) {
        console.log(chalk.red('Invalid entity in addNewEntityToCameraToolsLayer fn'));
        return false;
      }
      const dataSource: Cesium.DataSource | undefined =
        this?.$viewerService.viewer.dataSources?.getByName(
          this.$toolsService.cameraToolsLayerName,
        )?.[0];
      if (dataSource) {
        dataSource.entities.add(entity);
        return true;
      } else {
        console.log(chalk.red("Data source hasn't found in addNewEntityToCameraToolsLayer fn"));
        return false;
      }
    } catch (error: unknown) {
      throw error;
    }
  }
}
