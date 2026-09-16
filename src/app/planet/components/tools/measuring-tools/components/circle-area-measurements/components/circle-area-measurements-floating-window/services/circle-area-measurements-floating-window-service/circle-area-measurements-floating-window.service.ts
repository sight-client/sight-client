import { computed, effect, Injectable, linkedSignal, untracked } from '@angular/core';
import chalk from 'chalk';
import * as Cesium from 'cesium';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { FloatingWindowsService } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';
import { MeasureService } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import type { MeasuringToolName } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import { CircleAreaMeasurementsService } from '@/components/tools/measuring-tools/components/circle-area-measurements/services/circle-area-measurements-service/circle-area-measurements.service';

import * as MeasuresLib from '@/components/tools/lib/basic-measure-calculations.lib';
import * as Humanify from '@/common/lib/humanify.lib';

// Запровайден в measuring-tools-floating-windows.ts
@Injectable()
export class CircleAreaMeasurementsFloatingWindowService {
  constructor(
    private $viewerService: ViewerService,
    private $floatingWindowsService: FloatingWindowsService,
    private $measureService: MeasureService,
    private $circleAreaMeasurementsService: CircleAreaMeasurementsService,
    private $toolsService: ToolsService,
  ) {
    // --------------------- Блок стандартных для окон инструментов методов и состояний (start) --------------------- //
    this.toolName = this.$circleAreaMeasurementsService.toolName;
    // Существование окна по условию наличия сущностей его инструмента
    effect(() => {
      try {
        if (this.$measureService.isCircles() === true) {
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
        console.log(chalk.red(error));
      }
    });
    // Deprecated (на текущий момент для мерителей поддерживается только единоразовый сценарий использования)
    // Сокрытие окна инструмента при удалении его сущности, в настоящий момент отображенной в таком окне
    // effect(() => {
    //   try {
    //     if (this.$circleAreaMeasurementsService.circleAreaMeasurementsList().length) {
    //       untracked(() => {
    //         if (this._validPickedEnttity()) {
    //         const nowGroupId: string | undefined = this._validPickedEnttity()?.id.split('-')[0];
    //         const index = this.$circleAreaMeasurementsService
    //           .circleAreaMeasurementsList()
    //           .findIndex((item) => item?.groupId === nowGroupId);
    //         if (index === -1) this.$floatingWindowsService.hideWindowByToolName(this.toolName);
    //         }
    //       });
    //     }
    //   } catch (error: unknown) {
    //     console.log(chalk.red(error));
    //   }
    // });
    // Удаление сущностей инструмента с холста при уделении его плавающего окна
    effect(() => {
      try {
        if (this.floatingWindowHasClosed() === true) {
          untracked(() => {
            this._validPickedEnttity.set(undefined);
            if (this.$measureService.isCircles() === true) {
              this.$measureService.allToolEntitiesCleaning(this.toolName);
            }
            if (
              this.$circleAreaMeasurementsService.measureHasStarted() ||
              this.$circleAreaMeasurementsService.isActive()
            ) {
              this.$circleAreaMeasurementsService.cancelThisTool();
            }
          });
        }
      } catch (error: unknown) {
        console.log(chalk.red(error));
      }
    });
  }
  // Еще используется в circle-area-measurements-floating-window.html
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
      // @ts-ignore (конфликт - кастомное свойство toolName)
      if (selectedEntity?.toolName !== this.toolName) return;
      if (!this.$circleAreaMeasurementsService.circleAreaMeasurementsList().length) return;
      const indexGroup = this.$circleAreaMeasurementsService
        .circleAreaMeasurementsList()
        .findIndex((group) => selectedEntity.id.startsWith(group!.groupId));
      if (indexGroup === -1) return;
      const group = this.$circleAreaMeasurementsService.circleAreaMeasurementsList()[indexGroup];
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
  // Еще используется в circle-area-measurements-floating-window.html
  private _validPickedEnttity = linkedSignal<Cesium.Entity | undefined, Cesium.Entity | undefined>({
    source: this.newPickedEntity,
    computation(newVal, prevVal) {
      return newVal !== undefined ? newVal : prevVal?.value;
    },
  });
  // Еще используется в circle-area-measurements-floating-window.html
  get validPickedEnttity() {
    return this._validPickedEnttity;
  }
  // Для указания радиуса
  private _validAuxiliaryEntity = computed<Cesium.Entity | undefined>(() => {
    if (this._validPickedEnttity()) {
      let targetEntity: Cesium.Entity | undefined = undefined;
      untracked(() => {
        const store = this.$measureService.circleAreaMeasurementsList;
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
    }
  });
  get validAuxiliaryEntity() {
    return this._validAuxiliaryEntity;
  }
  // --------------------- Блок стандартных для окон инструментов методов и состояний (end) ----------------------- //

  private _radius = computed<number>(() => {
    let radius: number = 0;
    if (this._validAuxiliaryEntity() !== undefined) {
      untracked(() => {
        const semiMinorAxis: number | undefined =
          this._validPickedEnttity()?.ellipse?.semiMinorAxis?.getValue();
        const semiMajorAxis: number | undefined =
          this._validPickedEnttity()?.ellipse?.semiMajorAxis?.getValue();
        // Проверка на окружность
        if (semiMinorAxis !== undefined && semiMinorAxis === semiMajorAxis) {
          const radiusPolylinePositions: Array<Cesium.Cartesian3> =
            this._validAuxiliaryEntity()!.polyline?.positions?.getValue();
          if (
            radiusPolylinePositions?.length ||
            !(radiusPolylinePositions[0] instanceof Cesium.Cartesian3)
          ) {
            radius = MeasuresLib.calculatePosDistancesWhithoutHumanify(radiusPolylinePositions);
          } else {
            console.log(
              chalk.red('Invalid radiusPolylinePositions array in validAuxiliaryEntity signal'),
            );
          }
        } else {
          console.log(chalk.red('Invalid ellipse in validAuxiliaryEntity signal'));
        }
      });
    }
    return radius;
  });
  get radius() {
    return this._radius;
  }

  private _radiusDescription = computed<string>(() => {
    let radiusText: string = '';
    if (this._radius()) {
      untracked(() => {
        radiusText = Humanify.distanceM(this._radius());
      });
    }
    return radiusText;
  });
  // Еще используется в circle-area-measurements-floating-window.html
  get radiusDescription() {
    return this._radiusDescription;
  }

  // ------------------------------------------------------------------ //

  private _area = computed<number>(() => {
    let area: number = 0;
    if (this._radius()) {
      untracked(() => {
        area = 3.14 * Math.pow(this._radius(), 2);
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
  // Еще используется в circle-area-measurements-floating-window.html
  get areaDescription() {
    return this._areaDescription;
  }

  // ------------------------------------------------------------------ //

  private _perimeter = computed<number>(() => {
    let perimeter: number = 0;
    if (this._radius()) {
      untracked(() => {
        // Проверка на окружность - в _radius-сигнале
        perimeter = 2 * 3.14 * this._radius();
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
  // Еще используется в circle-area-measurements-floating-window.html
  get perimeterDescription() {
    return this._perimeterDescription;
  }

  // ------------------------------------------------------------------ //

  // Deprecated
  // public changeCircleEntitiesColor(newColor: string) {
  //   try {
  //     const store = this.$measureService.circleAreaMeasurementsList;
  //     let indexGroup, indexValidEntity;
  //     [indexGroup, indexValidEntity] = this.$toolsService.findEntityPathInStore(
  //       this.validPickedEnttity()!.id,
  //       this.$measureService.circleAreaMeasurementsList,
  //     );
  //     if (indexGroup === undefined || indexValidEntity === undefined)
  //       throw new Error("Entity's path search error in changeCircleEntityColor fn");
  //     store.update((oldStore) => {
  //       oldStore[indexGroup]!.entitiesList[indexValidEntity]!.polyline!.material =
  //         new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(newColor)); // .withAlpha даст ошибку несовместимости с html input hex color
  //       const indexRadius = oldStore[indexGroup]!.entitiesList.findIndex((entity) =>
  //         entity?.id.includes('-line-'),
  //       );
  //       if (indexRadius !== -1) {
  //         oldStore[indexGroup]!.entitiesList[indexRadius]!.polyline!.material =
  //           new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(newColor)); // .withAlpha даст ошибку несовместимости с html input hex color
  //       }
  //       const newStore = [...oldStore];
  //       return newStore;
  //     });
  //     return true;
  //   } catch (error: unknown) {
  //     console.log(chalk.red(error));
  //     return false;
  //   }
  // }
}
