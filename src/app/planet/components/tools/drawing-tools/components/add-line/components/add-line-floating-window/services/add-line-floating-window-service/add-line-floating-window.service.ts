import { computed, effect, Injectable, linkedSignal, untracked } from '@angular/core';
import chalk from 'chalk';
import * as Cesium from 'cesium';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { FloatingWindowsService } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';
import { DrawingService } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import type { DrawingToolName } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { AddLineService } from '@/components/tools/drawing-tools/components/add-line/services/add-line-service/add-line.service';

// Запровайден в tools-floating-windows.ts
@Injectable()
export class AddLineFloatingWindowService {
  constructor(
    private $viewerService: ViewerService,
    private $floatingWindowsService: FloatingWindowsService,
    private $drawingService: DrawingService,
    private $addLineService: AddLineService,
  ) {
    // --------------------- Блок стандартных для окон инструментов методов и состояний (start) --------------------- //
    this.toolName = this.$addLineService.toolName;
    // Существование окна по условию наличия сущностей его инструмента
    effect(() => {
      try {
        if (this.$drawingService.isLines() === true) {
          untracked(() => {
            this.$floatingWindowsService.addWindowItem(this.toolName);
            // Ситуация при импорте из файла (при отсутсвии таких сущностей)
            if (!this._validPickedEnttity()) {
              const firstEntity: Cesium.Entity | undefined =
                this.$drawingService.addLineEntitiesList()?.[0]?.defaultEntity ||
                this.$drawingService.addLineEntitiesList()?.[0]?.entitiesList?.[0];
              if (!firstEntity || !(firstEntity instanceof Cesium.Entity)) {
                console.log(chalk.red('Invalid entity has added'));
                return;
              } else {
                this._validPickedEnttity.set(firstEntity);
              }
            }
          });
        } else {
          untracked(() => {
            this.$floatingWindowsService.deleteWindowItem(this.toolName);
            this._validPickedEnttity.set(undefined);
          });
        }
      } catch (error: unknown) {
        console.log(chalk.red(error));
      }
    });
    // // Добавление или показ окна по активации (кнопке) инструмента (до построения первой сущности) по причине наличия опций построения
    // effect(() => {
    //   try {
    //     if (this.$addLineService.isActive() === true) {
    //       untracked(() => {
    //         const index = this.$floatingWindowsService
    //           .floatingWindowsList()
    //           .findIndex((item) => item?.windowName === this.toolName);
    //         if (index !== -1) {
    //           this.$floatingWindowsService.showActiveWindow(this.toolName, undefined, index);
    //         } else {
    //           if (!this.$drawingService.addLineEntitiesList().length) {
    //             this.$floatingWindowsService.addWindowItem(this.toolName);
    //           }
    //         }
    //       });
    //     }
    //   } catch (error: unknown) {
    //     console.log(chalk.red(error));
    //   }
    // });
    // // Показ (без добавления) окна по построению первой сущности
    // effect(() => {
    //   try {
    //     if (this.$drawingService.isLines() === true) {
    //       untracked(() => {
    //         const index = this.$floatingWindowsService
    //           .floatingWindowsList()
    //           .findIndex((item) => item?.windowName === this.toolName);
    //         if (index !== -1) {
    //           this.$floatingWindowsService.showActiveWindow(this.toolName, undefined, index);
    //         }
    //       });
    //     }
    //   } catch (error: unknown) {
    //     console.log(chalk.red(error));
    //   }
    // });
    // // Удаление окна вместе с последней относящейся к нему сущностью
    // effect(() => {
    //   try {
    //     if (this.$addLineService.hasErasedAll() === true) {
    //       untracked(() => {
    //         this._validPickedEnttity.set(undefined);
    //         this.$floatingWindowsService.deleteWindowItem(this.toolName);
    //       });
    //     }
    //   } catch (error: unknown) {
    //     console.log(chalk.red(error));
    //   }
    // });
    // Сокрытие (без удаления) окна при удалении активной (отображаемой в нем) сущности
    effect(() => {
      try {
        if (this.$addLineService.addLineEntitiesList().length) {
          untracked(() => {
            if (this._validPickedEnttity()) {
              const nowGroupId: string | undefined = this._validPickedEnttity()?.id.split('-')[0];
              const index = this.$addLineService
                .addLineEntitiesList()
                .findIndex((item) => item?.groupId === nowGroupId);
              if (index === -1) this.$floatingWindowsService.hideWindowByToolName(this.toolName);
            }
          });
        }
      } catch (error: unknown) {
        console.log(chalk.red(error));
      }
    });
  }
  // Еще используется в add-line-floating-window.html
  declare public readonly toolName: DrawingToolName;

  // Отлов сущности, соответствующей данному плавающему окну, для отображения в нем (исключение вспомогательных сущностей в группе)
  private newPickedEntity = computed<Cesium.Entity | undefined>(() => {
    const selectedEntity = this.$viewerService.viewer?.newPickedEntity?.();
    let targetEntity: Cesium.Entity | undefined = undefined;
    untracked(() => {
      // @ts-ignore (конфликт - кастомное свойство toolName)
      if (selectedEntity?.toolName !== this.toolName) return;
      if (!this.$addLineService.addLineEntitiesList().length) return;
      const indexGroup = this.$addLineService
        .addLineEntitiesList()
        .findIndex((group) => selectedEntity.id.startsWith(group!.groupId));
      if (indexGroup === -1) return;
      const group = this.$addLineService.addLineEntitiesList()[indexGroup];
      if (group?.defaultEntity) {
        targetEntity = group.defaultEntity;
      } else {
        if (!group?.entitiesList.length) return;
        const indexEntity = group?.entitiesList.findIndex((entity) =>
          entity!.id.includes('-line-'),
        );
        if (indexEntity === -1) return;
        targetEntity = group.entitiesList[indexEntity];
      }
    });
    return targetEntity;
  });
  // Еще используется в add-line-floating-window.html
  private _validPickedEnttity = linkedSignal<Cesium.Entity | undefined, Cesium.Entity | undefined>({
    source: this.newPickedEntity,
    computation(newVal, prevVal) {
      return newVal !== undefined ? newVal : prevVal?.value;
    },
  });
  // Еще используется в add-line-floating-window.html
  get validPickedEnttity() {
    return this._validPickedEnttity;
  }
  // --------------------- Блок стандартных для окон инструментов методов и состояний (end) ----------------------- //
}
