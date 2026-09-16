import { Injectable, computed, linkedSignal, untracked, effect } from '@angular/core';
import chalk from 'chalk';
import * as Cesium from 'cesium';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { FloatingWindowsService } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';
import { DrawingService } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import type { DrawingToolName } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { AddMarkService } from '@/components/tools/drawing-tools/components/add-mark/services/add-mark-service/add-mark.service';

// Запровайден в tools-floating-windows.ts
@Injectable()
export class AddMarkFloatingWindowService {
  constructor(
    private $viewerService: ViewerService,
    private $drawingService: DrawingService,
    private $addMarkService: AddMarkService,
    private $floatingWindowsService: FloatingWindowsService,
  ) {
    // --------------------- Блок стандартных для окон инструментов методов и состояний (start) --------------------- //
    this.toolName = this.$addMarkService.toolName;
    effect(() => {
      try {
        if (this.$drawingService.isMarks() === true) {
          untracked(() => {
            this.$floatingWindowsService.addWindowItem(this.toolName);
            // Ситуация при импорте из файла (при отсутсвии таких сущностей)
            if (!this._validPickedEnttity()) {
              const firstEntity: Cesium.Entity | undefined =
                this.$drawingService.addMarkEntitiesList()?.[0]?.defaultEntity ||
                this.$drawingService.addMarkEntitiesList()?.[0]?.entitiesList?.[0];
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
        if (this.$addMarkService.addMarkEntitiesList().length) {
          untracked(() => {
            if (this._validPickedEnttity()) {
              const nowGroupId: string | undefined = this._validPickedEnttity()?.id.split('-')[0];
              const index = this.$addMarkService
                .addMarkEntitiesList()
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
  // Еще используется в add-mark-floating-window.html
  declare public readonly toolName: DrawingToolName;
  // Notice: newPickedEntity также обновляется при каждом успешном окончании сценария использования инструмента (заложено в функциях drawing.service.ts)
  private newPickedEntity = computed<Cesium.Entity | undefined>(() => {
    // @ts-ignore (конфликт - кастомное свойство toolName)
    if (this.$viewerService.viewer?.newPickedEntity?.()?.toolName === this.toolName) {
      return this.$viewerService.viewer?.newPickedEntity?.();
    } else return undefined;
  });
  // Еще используется в add-mark-floating-window.html
  private _validPickedEnttity = linkedSignal<Cesium.Entity | undefined, Cesium.Entity | undefined>({
    source: this.newPickedEntity,
    computation(newVal, prevVal) {
      return newVal !== undefined ? newVal : prevVal?.value; // notice: prevVal?.source - предыдущее значения source-сигнала (не текущего linkedSignal)
      // Notice: computation не видит контекст компонента (если нужен - можно использовать значение linkedSignal в виде результата работы метода компонента)
      // return newVal?.toolName === this.parentName ? newVal : prevVal?.value;
    },
  });
  // Еще используется в add-mark-floating-window.html
  get validPickedEnttity() {
    return this._validPickedEnttity;
  }
  // Позволяет обновлять данные при перемещении метки
  get flag() {
    return this.$viewerService.forcedEntityPickingEffectFlag();
  }
  // Переобновление сущности с новыми свойствами
  // $addMarkService нужно знать изменения
  public changesEntity(entity: any) {
    this.$viewerService.setNewPickedEntity(entity);
  }
  // --------------------- Блок стандартных для окон инструментов методов и состояний (end) ----------------------- //
}
