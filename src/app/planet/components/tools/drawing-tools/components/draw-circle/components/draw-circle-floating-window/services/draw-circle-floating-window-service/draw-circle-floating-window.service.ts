import { reportError } from '@global/lib/report-error.lib';
import {
  computed,
  effect,
  Injectable,
  linkedSignal,
  untracked,
  WritableSignal,
} from '@angular/core';
import * as Cesium from 'cesium';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import {
  ToolsService,
  colorFromCssString,
} from '@/components/tools/services/tools-service/tools.service';
import type { EntitiesGroup } from '@/components/tools/services/tools-service/tools.service';
import { FloatingWindowsService } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';
import { DrawingService } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import type { DrawingToolName } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { DrawCircleService } from '@/components/tools/drawing-tools/components/draw-circle/services/draw-circle-service/draw-circle.service';

// Запровайден в tools-floating-windows.ts
@Injectable()
export class DrawCircleFloatingWindowService {
  constructor(
    private $viewerService: ViewerService,
    private $floatingWindowsService: FloatingWindowsService,
    private $drawingService: DrawingService,
    private $drawCircleService: DrawCircleService,
    private $toolsService: ToolsService,
  ) {
    // --------------------- Блок стандартных для окон инструментов методов и состояний (start) --------------------- //
    this.toolName = this.$drawCircleService.toolName;
    effect(() => {
      try {
        if (this.$drawingService.isCircles() === true) {
          untracked(() => {
            this.$floatingWindowsService.addWindowItem(this.toolName);
            // Ситуация при импорте из файла (при отсутсвии таких сущностей)
            if (!this._validPickedEnttity()) {
              const firstEntity: Cesium.Entity | undefined =
                this.$drawingService.drawCircleEntitiesList()?.[0]?.defaultEntity ||
                this.$drawingService.drawCircleEntitiesList()?.[0]?.entitiesList?.[0];
              if (!firstEntity || !(firstEntity instanceof Cesium.Entity)) {
                console.info('Invalid entity has added');
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
        reportError(error);
      }
    });
    effect(() => {
      try {
        if (this.$drawCircleService.drawCircleEntitiesList().length) {
          untracked(() => {
            if (this._validPickedEnttity()) {
              const nowGroupId: string | undefined = this._validPickedEnttity()?.id.split('-')[0];
              const index = this.$drawCircleService
                .drawCircleEntitiesList()
                .findIndex((item) => item?.groupId === nowGroupId);
              if (index === -1) this.$floatingWindowsService.hideWindowByToolName(this.toolName);
            }
          });
        }
      } catch (error: unknown) {
        reportError(error);
      }
    });
  }
  // Еще используется в draw-circle-floating-window.html
  declare public readonly toolName: DrawingToolName;
  // deprecated
  // Еще используется в draw-circle.ts
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
      if (selectedEntity?.toolName !== this.toolName) return;
      if (!this.$drawCircleService.drawCircleEntitiesList().length) return;
      const indexGroup = this.$drawCircleService
        .drawCircleEntitiesList()
        .findIndex((group) => !!group && selectedEntity.id.startsWith(group.groupId));
      if (indexGroup === -1) return;
      const group = this.$drawCircleService.drawCircleEntitiesList()[indexGroup];
      if (group?.defaultEntity) {
        targetEntity = group.defaultEntity;
      } else {
        if (!group?.entitiesList.length) return;
        const indexEntity = group?.entitiesList.findIndex((entity) =>
          !!entity && entity.id.includes('-ellipse-'),
        );
        if (indexEntity === -1) return;
        targetEntity = group.entitiesList[indexEntity];
      }
    });
    return targetEntity;
  });
  // Еще используется в draw-circle-floating-window.html
  private _validPickedEnttity = linkedSignal<Cesium.Entity | undefined, Cesium.Entity | undefined>({
    source: this.newPickedEntity,
    computation(newVal, prevVal) {
      return newVal !== undefined ? newVal : prevVal?.value;
    },
  });
  // Еще используется в draw-circle-floating-window.html
  get validPickedEnttity() {
    return this._validPickedEnttity;
  }
  // Для приведения радиуса
  // Используется в draw-circle-floating-window.html
  public validAuxiliaryEntity = computed<Cesium.Entity | undefined>(() => {
    const picked = this._validPickedEnttity();
    if (picked) {
      let targetEntity: Cesium.Entity | undefined = undefined;
      untracked(() => {
        const store = this.$drawingService.drawCircleEntitiesList;
        const indexGroup = this.$toolsService.findEntityPathInStore(picked.id, store).indexGroup;
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
      const picked = this.validPickedEnttity();
      if (!picked) return false;
      const store = this.$drawingService.drawCircleEntitiesList;
      const path = this.$toolsService.findEntityPathInStore(
        picked.id,
        this.$drawingService.drawCircleEntitiesList,
      );
      const indexGroup = path.indexGroup;
      const indexEntity = path.indexEntity;
      if (indexGroup === undefined || indexEntity === undefined)
        throw new Error("Entity's path search error in changeCircleEntityColor fn");
      const color = colorFromCssString(newColor);
      if (!color) return false;
      const material = new Cesium.ColorMaterialProperty(color);
      store.update((oldStore) => {
        const group = oldStore[indexGroup];
        const entity = group?.entitiesList[indexEntity];
        if (entity?.polyline) entity.polyline.material = material;
        const indexRadius = group?.entitiesList.findIndex((item) => item?.id.includes('-line-'));
        const radiusEntity =
          indexRadius !== undefined && indexRadius !== -1
            ? group?.entitiesList[indexRadius]
            : undefined;
        if (radiusEntity?.polyline) radiusEntity.polyline.material = material;
        const newStore = [...oldStore];
        return newStore;
      });
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }
}
