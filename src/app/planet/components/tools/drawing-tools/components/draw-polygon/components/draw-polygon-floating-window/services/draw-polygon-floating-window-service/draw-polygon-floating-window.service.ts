import { reportError } from '@global/lib/report-error.lib';
import { computed, effect, Injectable, linkedSignal, untracked } from '@angular/core';
import * as Cesium from 'cesium';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { FloatingWindowsService } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';
import { DrawingService } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import type { DrawingToolName } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { DrawPolygonService } from '@/components/tools/drawing-tools/components/draw-polygon/services/draw-polygon-service/draw-polygon.service';

// Запровайден в tools-floating-windows.ts
@Injectable()
export class DrawPolygonFloatingWindowService {
  constructor(
    private $viewerService: ViewerService,
    private $floatingWindowsService: FloatingWindowsService,
    private $drawingService: DrawingService,
    private $drawPolygonService: DrawPolygonService,
  ) {
    // --------------------- Блок стандартных для окон инструментов методов и состояний (start) --------------------- //
    this.toolName = this.$drawPolygonService.toolName;
    effect(() => {
      try {
        if (this.$drawingService.isPolygons() === true) {
          untracked(() => {
            this.$floatingWindowsService.addWindowItem(this.toolName);
            // Ситуация при импорте из файла (при отсутсвии таких сущностей)
            if (!this._validPickedEnttity()) {
              const firstEntity: Cesium.Entity | undefined =
                this.$drawingService.drawPolygonEntitiesList()?.[0]?.defaultEntity ||
                this.$drawingService.drawPolygonEntitiesList()?.[0]?.entitiesList?.[0];
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
        if (this.$drawPolygonService.drawPolygonEntitiesList().length) {
          untracked(() => {
            if (this._validPickedEnttity()) {
              const nowGroupId: string | undefined = this._validPickedEnttity()?.id.split('-')[0];
              const index = this.$drawPolygonService
                .drawPolygonEntitiesList()
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
  // Еще используется в draw-polygon-floating-window.html
  declare public readonly toolName: DrawingToolName;
  // deprecated
  // Еще используется в draw-polygon.ts
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
      if (!this.$drawPolygonService.drawPolygonEntitiesList().length) return;
      const indexGroup = this.$drawPolygonService
        .drawPolygonEntitiesList()
        .findIndex((group) => !!group && selectedEntity.id.startsWith(group.groupId));
      if (indexGroup === -1) return;
      const group = this.$drawPolygonService.drawPolygonEntitiesList()[indexGroup];
      if (group?.defaultEntity) {
        targetEntity = group.defaultEntity;
      } else {
        if (!group?.entitiesList.length) return;
        const indexEntity = group?.entitiesList.findIndex((entity) =>
          !!entity && entity.id.includes('-polygon-'),
        );
        if (indexEntity === -1) return;
        targetEntity = group.entitiesList[indexEntity];
      }
    });
    return targetEntity;
  });
  // Еще используется в draw-polygon-floating-window.html
  private _validPickedEnttity = linkedSignal<Cesium.Entity | undefined, Cesium.Entity | undefined>({
    source: this.newPickedEntity,
    computation(newVal, prevVal) {
      return newVal !== undefined ? newVal : prevVal?.value;
    },
  });
  // Еще используется в draw-polygon-floating-window.html
  get validPickedEnttity() {
    return this._validPickedEnttity;
  }
  // --------------------- Блок стандартных для окон инструментов методов и состояний (end) ----------------------- //
}
