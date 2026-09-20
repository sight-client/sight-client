import { Injectable, effect, signal, untracked, WritableSignal } from '@angular/core';
import chalk from 'chalk';
import * as Cesium from 'cesium';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import type { EntitiesGroup } from '@/components/tools/services/tools-service/tools.service';
import {
  DrawingService,
  drawingToolsNames,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import type { DrawingToolName } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';

export type DrawingStores = Array<DrawingStoreItem>;

export type DrawingStoreItem = {
  storeName: string | DrawingToolName;
  collection: WritableSignal<Array<EntitiesGroup | undefined>>;
  activeObjInStore: WritableSignal<EntitiesGroup | undefined>;
};
export type DrawingStoreForOvers = {
  storeName: string | DrawingToolName;
  collection: WritableSignal<Array<EntitiesGroup | undefined>>;
};

// Запровайден в planet.ts
@Injectable()
export class DrawingsListService {
  declare public flyToEntity: (
    targetEntity: Cesium.Entity | undefined,
    whole?: boolean,
  ) => Promise<void>;

  constructor(
    private $viewerService: ViewerService,
    protected $drawingService: DrawingService,
  ) {
    // Отслеживает выбор по ЛКМ любой сущности на холсте, ВКЛЮЧАЯ ПОВТОРЫ (для выбора ее в списке данной панели)
    effect(() => {
      try {
        if (this.$viewerService.forcedEntityPickingEffectFlag() !== undefined) {
          untracked(() => {
            // console.log(this.$viewerService?.viewer?.forcedPickedEntity?.());
            const forcedPickedEntity = this.$viewerService?.viewer?.forcedPickedEntity?.();
            if (!forcedPickedEntity) return;
            // @ts-ignore (конфликт - кастомное свойство toolName)
            const forcedPickedToolName = forcedPickedEntity?.toolName;
            if (!forcedPickedToolName) return;
            let objInCollectionIndex: number = -1;
            // По drawingStoreForOvers поиск не проводится (т.к. для таких сущностей не предусмотрены плавающие окна и редактирование)
            for (const store of this.drawingStores) {
              if (store.storeName === forcedPickedToolName) {
                objInCollectionIndex = store
                  .collection()
                  .findIndex((objInCollection) =>
                    forcedPickedEntity.id.startsWith(`${objInCollection?.groupId}`),
                  );
                if (objInCollectionIndex !== -1) {
                  store.activeObjInStore.set(store.collection()[objInCollectionIndex]);
                  break;
                }
              }
            }
          });
        }
      } catch (error: unknown) {
        console.log(chalk.red(error));
        if (error instanceof Error) console.log(error.stack);
      }
    });
  }

  protected _drawingStores: DrawingStores = [];
  get drawingStores() {
    return this._drawingStores;
  }
  protected _drawingStoreForOvers: DrawingStoreForOvers = {
    storeName: 'Не связано с инструментами',
    collection: signal([]),
  };
  get drawingStoreForOvers() {
    return this._drawingStoreForOvers;
  }

  public startDrawingsListService(): void {
    try {
      this.flyToEntity = this.$viewerService.flyTo.bind(this.$viewerService);

      // Notice: состав литералов в типе DrawingToolName соответствует составу массива drawingToolsNames
      for (const toolName of drawingToolsNames) {
        this._drawingStores.push({
          storeName: toolName,
          collection: this?.$drawingService?.allEntitiesListsLinks?.[toolName] || signal([]),
          activeObjInStore: signal(undefined),
        });
      }
      this._drawingStoreForOvers.collection = this?.$drawingService?.overEntitiesList || signal([]);
      // ...другие пополнения drawingStores
    } catch (error: unknown) {
      console.log(chalk.red('Ошибка старта DrawingsListService'));
      throw error;
    }
  }

  // Хэндлер для ЛКМ по элементу списка
  public setActiveEntity(objInCollection: EntitiesGroup): boolean {
    try {
      if (
        objInCollection?.defaultEntity &&
        objInCollection.defaultEntity instanceof Cesium.Entity
      ) {
        this.$viewerService.setNewPickedEntity(objInCollection.defaultEntity);
        return true;
      }
      if (objInCollection?.groupId) {
        this.$viewerService.setNewPickedEntity(
          objInCollection.entitiesList[objInCollection.entitiesList.length - 1],
        );
        return true;
      } else {
        throw new Error('Invalid object in setActiveEntity fn');
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      if (error instanceof Error) console.log(error.stack);
      return false;
    }
  }

  // Отслеживается табами левой панели m
  private _linesCounter = signal<number>(0);
  get linesCounter() {
    return this._linesCounter;
  }
  // Используется drawings-list.ts
  public changeLineCounter(changes: number) {
    const oldVal: number = this._linesCounter();
    this._linesCounter.set(oldVal + changes);
  }
}
