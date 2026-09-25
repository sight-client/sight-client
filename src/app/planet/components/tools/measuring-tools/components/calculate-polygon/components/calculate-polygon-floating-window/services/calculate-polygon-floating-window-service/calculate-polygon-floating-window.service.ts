import { reportError } from '@global/lib/report-error.lib';
import { computed, effect, Injectable, linkedSignal, untracked } from '@angular/core';
import * as Cesium from 'cesium';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { cartesian3ListFromProperty } from '@/components/tools/services/tools-service/tools.service';
import { FloatingWindowsService } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';
import { MeasureService } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import type { MeasuringToolName } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import { CalculatePolygonService } from '@/components/tools/measuring-tools/components/calculate-polygon/services/calculate-polygon-service/calculate-polygon.service';

import * as MeasuresLib from '@/components/tools/lib/basic-measure-calculations.lib';
import * as Humanify from '@/common/lib/humanify.lib';

// Запровайден в measuring-tools-floating-windows.ts
@Injectable()
export class CalculatePolygonFloatingWindowService {
  constructor(
    private $viewerService: ViewerService,
    private $floatingWindowsService: FloatingWindowsService,
    private $measureService: MeasureService,
    private $calculatePolygonService: CalculatePolygonService,
  ) {
    // --------------------- Блок стандартных для окон инструментов методов и состояний (start) --------------------- //
    this.toolName = this.$calculatePolygonService.toolName;
    // Существование окна по условию наличия сущностей его инструмента
    effect(() => {
      try {
        if (this.$measureService.isPolygons() === true) {
          untracked(() => {
            this.$floatingWindowsService.addWindowItem(this.toolName);
          });
        } else {
          untracked(() => {
            this._validPickedEnttity.set(undefined);
            this.$floatingWindowsService.deleteWindowItem(this.toolName);
          });
        }
      } catch (error: unknown) {
        reportError(error);
      }
    });
    // Deprecated (на текущий момент для мерителей поддерживается только единоразовый сценарий использования)
    // Сокрытие окна инструмента при удалении его сущности, в настоящий момент отображенной в таком окне
    // effect(() => {
    //   try {
    //     if (this.$calculatePolygonService.calculatePolygonList().length) {
    //       untracked(() => {
    //         if (this._validPickedEnttity()) {
    //         const nowGroupId: string | undefined = this._validPickedEnttity()?.id.split('-')[0];
    //         const index = this.$calculatePolygonService
    //           .calculatePolygonList()
    //           .findIndex((item) => item?.groupId === nowGroupId);
    //         if (index === -1) this.$floatingWindowsService.hideWindowByToolName(this.toolName);
    //         }
    //       });
    //     }
    //   } catch (error: unknown) {
    //     reportError(error);
    //   }
    // });
    // Удаление сущностей инструмента с холста при уделении его плавающего окна
    effect(() => {
      try {
        if (this.floatingWindowHasClosed() === true) {
          untracked(() => {
            this._validPickedEnttity.set(undefined);
            if (this.$measureService.isPolygons() === true) {
              this.$measureService.allToolEntitiesCleaning(this.toolName);
            }
            if (
              this.$calculatePolygonService.measureHasStarted() ||
              this.$calculatePolygonService.isActive()
            ) {
              this.$calculatePolygonService.cancelThisTool();
            }
          });
        }
      } catch (error: unknown) {
        reportError(error);
      }
    });
  }
  // Еще используется в calculate-polygon-floating-window.html
  declare public readonly toolName: MeasuringToolName;

  public readonly isFloatingWindow = computed<boolean>(() => {
    const index = this.$floatingWindowsService
      .floatingWindowsList()
      .findIndex((item) => item?.windowName === this.toolName);
    if (index !== -1) return true;
    else return false;
  });

  private readonly floatingWindowHasClosed = linkedSignal<boolean, boolean>({
    source: this.isFloatingWindow,
    computation(newVal, prevVal) {
      return prevVal?.source === true && newVal === false ? true : false;
    },
  });

  private newPickedEntity = computed<Cesium.Entity | undefined>(() => {
    const selectedEntity = this.$viewerService.viewer?.newPickedEntity?.();
    let targetEntity: Cesium.Entity | undefined = undefined;
    untracked(() => {
      if (selectedEntity?.toolName !== this.toolName) return;
      if (!this.$calculatePolygonService.calculatePolygonList().length) return;
      const indexGroup = this.$calculatePolygonService
        .calculatePolygonList()
        .findIndex((group) => !!group && selectedEntity.id.startsWith(group.groupId));
      if (indexGroup === -1) return;
      const group =
        this.$calculatePolygonService.calculatePolygonList()[indexGroup];
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
  // Еще используется в calculate-polygon-floating-window.html
  private _validPickedEnttity = linkedSignal<Cesium.Entity | undefined, Cesium.Entity | undefined>({
    source: this.newPickedEntity,
    computation(newVal, prevVal) {
      return newVal !== undefined ? newVal : prevVal?.value;
    },
  });
  // Еще используется в calculate-polygon-floating-window.html
  get validPickedEnttity() {
    return this._validPickedEnttity;
  }
  // --------------------- Блок стандартных для окон инструментов методов и состояний (end) ----------------------- //

  private _area = computed<number>(() => {
    let area: number = 0;
    if (this._validPickedEnttity() !== undefined) {
      untracked(() => {
        const polygonPolylinePositions = cartesian3ListFromProperty(
          this._validPickedEnttity()?.polyline?.positions?.getValue(),
        );
        if (
          polygonPolylinePositions?.length &&
          polygonPolylinePositions[0] instanceof Cesium.Cartesian3
        ) {
          area = MeasuresLib.calculateAreaWithTurfWithoutHumanify(polygonPolylinePositions);
        } else {
          console.info('Invalid polygonPolylinePositions array in validPickedEnttity signal');
        }
      });
    }
    return area;
  });
  get area() {
    return this._area;
  }

  private _areaDescription = computed<string>(() => {
    let areaText: string = '';
    if (this._area()) {
      untracked(() => {
        areaText = Humanify.areaKm(Math.abs(this.area()));
      });
    }
    return areaText;
  });
  // Еще используется в calculate-polygon-floating-window.html
  get areaDescription() {
    return this._areaDescription;
  }

  // ------------------------------------------------------------------ //

  private _perimeter = computed<number>(() => {
    let perimeter: number = 0;
    if (this._validPickedEnttity() !== undefined) {
      untracked(() => {
        const polygonPolylinePositions = cartesian3ListFromProperty(
          this._validPickedEnttity()?.polyline?.positions?.getValue(),
        );
        if (
          polygonPolylinePositions?.length &&
          polygonPolylinePositions[0] instanceof Cesium.Cartesian3
        ) {
          perimeter = MeasuresLib.calculatePosDistancesWithoutHumanify(polygonPolylinePositions);
        } else {
          console.info('Invalid polygonPolylinePositions array in validPickedEnttity signal');
        }
      });
    }
    return perimeter;
  });
  get perimeter() {
    return this._perimeter;
  }

  private _perimeterDescription = computed<string>(() => {
    let perimeterText: string = '';
    if (this._perimeter()) {
      untracked(() => {
        perimeterText = Humanify.distanceM(this._perimeter());
      });
    }
    return perimeterText;
  });
  // Еще используется в calculate-polygon-floating-window.html
  get perimeterDescription() {
    return this._perimeterDescription;
  }
}
