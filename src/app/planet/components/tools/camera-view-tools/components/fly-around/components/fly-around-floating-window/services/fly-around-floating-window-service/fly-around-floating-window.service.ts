import { computed, effect, Injectable, linkedSignal, untracked } from '@angular/core';
// import chalk from 'chalk';
// import * as Cesium from 'cesium';

// import { ViewerService } from '@/common/services/viewer-service/viewer.service';
// import { FloatingWindowsService } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';
// import { CameraViewToolsService } from '@/components/tools/camera-view-tools/services/camera-view-tools-service/camera-view-tools.service';
// import type { CameraToolName } from '@/components/tools/camera-view-tools/services/camera-view-tools-service/camera-view-tools.service';
// import { FlyAroundService } from '@/components/tools/camera-view-tools/components/fly-around/services/fly-around-service/fly-around.service';

// Запровайден в tools-floating-windows.ts
@Injectable()
export class FlyAroundFloatingWindowService {
  constructor() {
    // private $viewerService: ViewerService,
    // private $floatingWindowsService: FloatingWindowsService,
    // private $cameraViewToolsService: CameraViewToolsService,
    // private $flyAroundService: FlyAroundService,
    // --------------------- Блок стандартных для окон инструментов методов и состояний (start) --------------------- //
    // this.toolName = this.$flyAroundService.toolName;
    // effect(() => {
    //   try {
    //     if (this.$cameraViewToolsService.isFlyAroundEntities() === true) {
    //       untracked(() => {
    //         this.$floatingWindowsService.addWindowItem(this.toolName);
    //       });
    //     } else {
    //       untracked(() => {
    //         this.$floatingWindowsService.deleteWindowItem(this.toolName);
    //       });
    //     }
    //   } catch (error: unknown) {
    //     console.log(chalk.red(error));
    //   }
    // });
    // effect(() => {
    //   try {
    //     if (this.$flyAroundService.flyAroundEntitiesList().length) {
    //       untracked(() => {
    //         if (this._validPickedEnttity()) {
    //           const nowGroupId: string | undefined = this._validPickedEnttity()?.id.split('-')[0];
    //           const index = this.$flyAroundService
    //             .flyAroundEntitiesList()
    //             .findIndex((item) => item?.groupId === nowGroupId);
    //           if (index === -1) this.$floatingWindowsService.hideWindowByToolName(this.toolName);
    //         }
    //       });
    //     }
    //   } catch (error: unknown) {
    //     console.log(chalk.red(error));
    //   }
    // });
  }
  // Еще используется в flyAround-floating-window.html
  // declare public readonly toolName: CameraToolName;
  // deprecated
  // Еще используется в flyAround.ts
  // public readonly isFloatingWindow = computed<boolean>(() => {
  //   const index = this.$floatingWindowsService
  //     .floatingWindowsList()
  //     .findIndex((item) => item?.windowName === this.toolName);
  //   if (index !== -1) return true;
  //   else return false;
  // });

  // private newPickedEntity = computed<Cesium.Entity | undefined>(() => {
  //   // @ts-ignore (конфликт - кастомное свойство toolName)
  //   if (this.$viewerService.viewer?.newPickedEntity?.()?.toolName === this.toolName) {
  //     return this.$viewerService.viewer?.newPickedEntity?.();
  //   } else return undefined;
  // });
  // // Еще используется в flyAround-floating-window.html
  // private _validPickedEnttity = linkedSignal<Cesium.Entity | undefined, Cesium.Entity | undefined>({
  //   source: this.newPickedEntity,
  //   computation(newVal, prevVal) {
  //     return newVal !== undefined ? newVal : prevVal?.value;
  //   },
  // });
  // // Еще используется в flyAround-floating-window.html
  // get validPickedEnttity() {
  //   return this._validPickedEnttity;
  // }
  // --------------------- Блок стандартных для окон инструментов методов и состояний (end) ----------------------- //
}
