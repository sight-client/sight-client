import { reportError } from '@global/lib/report-error.lib';
import { Injectable, WritableSignal, computed, effect, signal, untracked } from '@angular/core';
import * as Cesium from 'cesium';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { CheckMobileDeviceService } from '@global/services/check-mobile-device-service/check-mobile-device.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import type { EntitiesGroup } from '@/components/tools/services/tools-service/tools.service';
import {
  DrawingService,
  isDrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';

// Запровайден в planet.ts
@Injectable()
export class EntityRubberService {
  constructor(
    private $viewerService: ViewerService,
    private $drawingService: DrawingService,
    private $toolsService: ToolsService,
    private $checkMobileDeviceService: CheckMobileDeviceService,
  ) {
    // ------------------ Блок логики автоматической деактивации инструмента (start) ------------------ //
    effect(() => {
      try {
        if (this.storesAreEmpty() === true) {
          untracked(() => {
            if (this.isActive() === true) {
              this.cancelThisTool();
            }
          });
        }
      } catch (error: unknown) {
        reportError(error);
      }
    });
  }
  // Еще используется в entity-rubber.ts (пока отключено - если кнопка находится в контейнере дефолтной подгруппы и дисэйблится, выглядит плохо; сценарий заменен на алерт)
  public readonly storesAreEmpty = computed<boolean>(() => {
    return (
      !this.$drawingService.isMarks() &&
      !this.$drawingService.isLines() &&
      !this.$drawingService.isRectangles() &&
      !this.$drawingService.isCircles() &&
      !this.$drawingService.isPolygons() &&
      !this.$drawingService.isVectorPolygons() &&
      !this.$drawingService.isAnnotations() &&
      !this.$drawingService.isPhotos() &&
      !this.$drawingService.isDomes() &&
      !this.$drawingService.isHeatmap() &&
      // ...другие флаги
      !this.$drawingService.isRoutes() &&
      !this.$drawingService.isOver()
    );
  });
  // ------------------ Блок логики автоматической деактивации инструмента (end) -------------------- //

  // -------------------------- Блок отработки кнопки инструмента (start) --------------------------- //
  // Еще используется в entity-rubber.ts
  public readonly drawingsBlocker = computed(() => this.$toolsService.drawingsBlocker());
  private _isActive = signal<boolean>(false);
  // Еще используется в entity-rubber.ts
  get isActive() {
    return this._isActive;
  }
  // Используется в entity-rubber.ts
  public buttonHandler(event: MouseEvent): void {
    // event.stopPropagation(); // не применять! (событие также ловится в родителе (drawing-tools.ts))
    if (event.button === 0) {
      if (this.storesAreEmpty() === true) {
        alert('Сущности к удалению отсутствуют');
      } else this.toggleCleaning();
    } else if (event.button === 1) {
      if (this.isActive() === true) {
        this.cancelThisTool();
      }
    }
  }
  private toggleCleaning(): void {
    try {
      if (this.isActive() === false) {
        this.isActive.set(true);
        this.startEntitiesCleaning();
      } else if (this.isActive() === true) {
        this.cancelThisTool();
      }
    } catch (error: unknown) {
      reportError(error);
      this.cancelThisTool();
    }
  }
  public cancelThisTool(): void {
    try {
      this.$drawingService.cancelDrawingTool();
    } catch (error: unknown) {
      reportError(error);
    } finally {
      this.isActive.set(false);
    }
  }
  // -------------------------- Блок отработки кнопки инструмента (end) ----------------------------- //

  // --------------------- Блок работы с Cesium-сущностями инструмента (start) ---------------------- //
  // Main-функция инструмента entity-rubber.ts
  public startEntitiesCleaning(): boolean {
    try {
      if (this.$toolsService.drawingsBlocker() === true) return false;
      this.$toolsService.clearCommonHandler();
      this.$toolsService.setDrawingsBlocker(true);
      this.$viewerService.onEntityPickingBlock();
      const eraseEntitiesGroup = (movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        try {
          let entity: Cesium.Entity | undefined = undefined;
          // if (!this.$checkMobileDeviceService.isMobile) {
          entity = this.$viewerService.pickEntityByClickOnScene(movement.position);
          // } else {
          //   entity = this.$viewerService.pickEntityByClickOnScene(
          //     new Cesium.Cartesian2(
          //       this.$viewerService.viewer?.scene?.canvas.scrollWidth / 2,
          //       this.$viewerService.viewer?.scene?.canvas.scrollHeight / 2,
          //     ),
          //   );
          // }
          let isRemove: boolean = false;
          if (entity?.id && typeof entity?.id === 'string') {
            const splitedId: string[] = entity.id.split('-');
            let groupId: string = '';
            if (splitedId.length > 1) groupId = splitedId[0];

            // ------------------ //
            // Ожидаемый сценарий
            // ------------------ //

            const entityToolName = entity.toolName;
            if (
              typeof entityToolName === 'string' &&
              isDrawingToolName(entityToolName) &&
              this.$drawingService.allEntitiesListsLinks[entityToolName]
            ) {
              if (groupId) {
                // Предполагается, что коллекции с искомым id / groupId будут размещены только в одном из сторов
                isRemove = this.$drawingService.removeEntitiesByGroupId(
                  groupId,
                  this.$drawingService.allEntitiesListsLinks[entityToolName],
                );
              } else {
                isRemove = this.$drawingService.removeOneEntityByGroupId(
                  entity.id,
                  this.$drawingService.allEntitiesListsLinks[entityToolName],
                );
              }
              return isRemove;

              // ----------------------------------- //
              // Резервный поиск (без учета toolName)
              // ----------------------------------- //
            } else {
              // ------------------------------------------------------ //
              const mainEntitiesStores: Array<WritableSignal<Array<EntitiesGroup | undefined>>> =
                Object.values(this.$drawingService.allEntitiesListsLinks);
              // Самое объемное хранилище перемещаем в конец последующего перебора (если оно и так не последнее)
              if (
                mainEntitiesStores.includes(this.$drawingService.routeEntityList) &&
                mainEntitiesStores[mainEntitiesStores.length - 1] !==
                  this.$drawingService.routeEntityList
              ) {
                const index = mainEntitiesStores.findIndex(
                  (store) => store === this.$drawingService.routeEntityList,
                );
                if (index !== -1) {
                  const movedItem = mainEntitiesStores.splice(index, 1);
                  mainEntitiesStores.push(...movedItem);
                }
              }
              // ------------------------------------------------------ //
              if (groupId) {
                // Первая очередь поиска (стор, характерный для "примитивов")
                isRemove = this.$drawingService.removeEntitiesByGroupId(
                  groupId,
                  this.$drawingService.overEntitiesList,
                );
                // Вторая очередь поиска (основные сторы)
                if (!isRemove) {
                  for (const entitiesStore of mainEntitiesStores) {
                    if (!isRemove)
                      isRemove = this.$drawingService.removeEntitiesByGroupId(
                        groupId,
                        entitiesStore,
                      );
                  }
                }
                return isRemove;
              } else {
                // Первая очередь поиска (стор, характерный для "примитивов")
                isRemove = this.$drawingService.removeOneEntityByGroupId(
                  entity.id,
                  this.$drawingService.overEntitiesList,
                );
                // Вторая очередь поиска (основные сторы)
                if (!isRemove) {
                  for (const entitiesStore of mainEntitiesStores) {
                    if (!isRemove)
                      isRemove = this.$drawingService.removeOneEntityByGroupId(
                        entity.id,
                        entitiesStore,
                      );
                  }
                }
                return isRemove;
              }
            }

            // Deprecated (контролируется местным эффектом)

            // ----------- //
            // Финализация
            // ----------- //

            // if (isRemove) {
            //   // Ручная проверка на необходимость деактивации инструмента
            //   // Notice: при удалении сущностей иными способами (например, посредством плавающих окон или их табов)
            //   // автоматическая деактивация данного инструмента произведена не будет
            //   const allEntitiesStores: Array<WritableSignal<Array<EntitiesGroup | undefined>>> =
            //     Object.values(this.$drawingService.allEntitiesListsLinks).concat(
            //       this.$drawingService.overEntitiesList,
            //     );
            //   let isEntities: boolean = false;
            //   for (const list of allEntitiesStores) {
            //     if (list().length !== 0) {
            //       isEntities = true;
            //       break;
            //     }
            //   }
            //   if (isEntities === false) {
            //     this.cancelThisTool();
            //   }
            // }
          }
          return isRemove;
        } catch (error: unknown) {
          this.cancelThisTool();
          reportError(error);
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
          return false;
        }
      };
      this.$toolsService.createNewCommonHandler('entityRubber');
      this.$toolsService.setCommonHandler(
        eraseEntitiesGroup,
        Cesium.ScreenSpaceEventType.LEFT_CLICK,
      );
      this.$toolsService.setCommonHandler(
        () => this.cancelThisTool(),
        Cesium.ScreenSpaceEventType.RIGHT_CLICK,
      );

      return true;
    } catch (error: unknown) {
      this.cancelThisTool();
      reportError(error);
      alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
      return false;
    }
  }
  // --------------------- Блок работы с Cesium-сущностями инструмента (start) ---------------------- //
}
