import {
  computed,
  effect,
  Injectable,
  linkedSignal,
  untracked,
  WritableSignal,
} from '@angular/core';
import chalk from 'chalk';
import * as Cesium from 'cesium';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import type { EntitiesGroup } from '@/components/tools/services/tools-service/tools.service';
import { FloatingWindowsService } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';
import { DrawingService } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import type { DrawingToolName } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { AddCircleService } from '@/components/tools/drawing-tools/components/add-circle/services/add-circle-service/add-circle.service';

// Запровайден в tools-floating-windows.ts
@Injectable()
export class AddCircleFloatingWindowService {
  constructor(
    private $viewerService: ViewerService,
    private $floatingWindowsService: FloatingWindowsService,
    private $drawingService: DrawingService,
    private $addCircleService: AddCircleService,
    private $toolsService: ToolsService,
  ) {
    // --------------------- Блок стандартных для окон инструментов методов и состояний (start) --------------------- //
    this.toolName = this.$addCircleService.toolName;
    effect(() => {
      try {
        if (this.$drawingService.isCircles() === true) {
          untracked(() => {
            this.$floatingWindowsService.addWindowItem(this.toolName);
            // Ситуация при импорте из файла (при отсутсвии таких сущностей)
            if (!this._validPickedEnttity()) {
              const firstEntity: Cesium.Entity | undefined =
                this.$drawingService.addCircleEntitiesList()?.[0]?.defaultEntity ||
                this.$drawingService.addCircleEntitiesList()?.[0]?.entitiesList?.[0];
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
    effect(() => {
      try {
        if (this.$addCircleService.addCircleEntitiesList().length) {
          untracked(() => {
            if (this._validPickedEnttity()) {
              const nowGroupId: string | undefined = this._validPickedEnttity()?.id.split('-')[0];
              const index = this.$addCircleService
                .addCircleEntitiesList()
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
  // Еще используется в add-circle-floating-window.html
  declare public readonly toolName: DrawingToolName;
  // deprecated
  // Еще используется в add-circle.ts
  // public readonly isFloatingWindow = computed<boolean>(() => {
  //   const index = this.$floatingWindowsService
  //     .floatingWindowsList()
  //     .findIndex((item) => item?.windowName === this.toolName);
  //   if (index !== -1) return true;
  //   else return false;
  // });

  private newPickedEntity = computed<Cesium.Entity | undefined>(() => {
    const selectedEntity = this.$viewerService.viewer?.newPickedEntity?.();
    let targetEntity: Cesium.Entity | undefined = undefined;
    untracked(() => {
      // @ts-ignore (конфликт - кастомное свойство toolName)
      if (selectedEntity?.toolName !== this.toolName) return;
      if (!this.$addCircleService.addCircleEntitiesList().length) return;
      const indexGroup = this.$addCircleService
        .addCircleEntitiesList()
        .findIndex((group) => selectedEntity.id.startsWith(group!.groupId));
      if (indexGroup === -1) return;
      const group = this.$addCircleService.addCircleEntitiesList()[indexGroup];
      if (group?.defaultEntity) {
        targetEntity = group.defaultEntity;
      } else {
        if (!group?.entitiesList.length) return;
        const indexEntity = group?.entitiesList.findIndex((entity) =>
          entity!.id.includes('-ellipse-'),
        );
        if (indexEntity === -1) return;
        targetEntity = group.entitiesList[indexEntity];
      }
    });
    return targetEntity;
  });
  // Еще используется в add-circle-floating-window.html
  private _validPickedEnttity = linkedSignal<Cesium.Entity | undefined, Cesium.Entity | undefined>({
    source: this.newPickedEntity,
    computation(newVal, prevVal) {
      return newVal !== undefined ? newVal : prevVal?.value;
    },
  });
  // Еще используется в add-circle-floating-window.html
  get validPickedEnttity() {
    return this._validPickedEnttity;
  }
  // Для приведения радиуса
  // Используется в add-circle-floating-window.html
  public validAuxiliaryEntity = computed<Cesium.Entity | undefined>(() => {
    if (this._validPickedEnttity()) {
      let targetEntity: Cesium.Entity | undefined = undefined;
      untracked(() => {
        const store = this.$drawingService.addCircleEntitiesList;
        const indexGroup = this.$toolsService.findEntityPathInStore(
          this.validPickedEnttity()!.id,
          store,
        ).indexGroup;
        if (indexGroup === -1 || indexGroup === undefined) return;
        const indexRadius = store()[indexGroup]?.entitiesList.findIndex((entity) =>
          entity?.id.includes('-line-'),
        );
        if (indexRadius === -1 || indexRadius === undefined) return;
        targetEntity = store()[indexGroup]?.entitiesList[indexRadius];
      });
      return targetEntity;
    } else return undefined;
  });
  // --------------------- Блок стандартных для окон инструментов методов и состояний (end) ----------------------- //

  public changeCircleEntitiesColor(newColor: string) {
    try {
      const store = this.$drawingService.addCircleEntitiesList;
      const path = this.$toolsService.findEntityPathInStore(
        this.validPickedEnttity()!.id,
        this.$drawingService.addCircleEntitiesList,
      );
      const indexGroup = path.indexGroup;
      const indexEntity = path.indexEntity;
      if (indexGroup === undefined || indexEntity === undefined)
        throw new Error("Entity's path search error in changeCircleEntityColor fn");
      store.update((oldStore) => {
        oldStore[indexGroup]!.entitiesList[indexEntity]!.polyline!.material =
          new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(newColor)); // .withAlpha даст ошибку несовместимости с html input hex color
        const indexRadius = oldStore[indexGroup]!.entitiesList.findIndex((entity) =>
          entity?.id.includes('-line-'),
        );
        if (indexRadius !== -1) {
          oldStore[indexGroup]!.entitiesList[indexRadius]!.polyline!.material =
            new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(newColor)); // .withAlpha даст ошибку несовместимости с html input hex color
        }
        const newStore = [...oldStore];
        return newStore;
      });
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }
}
