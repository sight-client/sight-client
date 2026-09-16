import { Injectable, computed, effect, linkedSignal, signal, untracked } from '@angular/core';
import * as Cesium from 'cesium';
import chalk from 'chalk';
import cloneDeep from 'lodash/cloneDeep';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import {
  CameraToolsService,
  getRusCameraToolName,
} from '@/components/tools/camera-tools/services/camera-tools-service/camera-tools.service';
import type {
  CameraToolsOptions,
  CameraToolName,
} from '@/components/tools/camera-tools/services/camera-tools-service/camera-tools.service';

// Запровайден в planet.ts
@Injectable()
export class FlyAroundService {
  // --------------------- Блок для хранения основных состояний сервиса (start) ----------------------- //
  // Еще используется в flyAround-floating-window.ts
  public readonly flyAroundEntitiesList = computed(() =>
    this.$cameraToolsService.flyAroundEntitiesList(),
  );
  // Еще используется в flyAround.ts
  public readonly drawingsBlocker = computed(() => this.$toolsService.drawingsBlocker());
  private _isActive = signal<boolean>(false);
  // Еще используется в flyAround.ts
  get isActive() {
    return this._isActive;
  }
  private drawingHasStarted = signal<boolean>(false);
  // --------------------- Блок для хранения основных состояний сервиса (end) ------------------------- //
  constructor(
    private $viewerService: ViewerService,
    private $cameraToolsService: CameraToolsService,
    private $toolsService: ToolsService,
  ) {
    // ------------------ Блок логики автоматической деактивации инструмента (start) ------------------ //
    // На текущий момент используется автоматическая очистка по окончанию сценария (завершению вращения)
    // effect(() => {
    //   try {
    //     if (this.flyAroundEntitiesList()) {
    //       untracked(() => {
    //         if (this.isActive() === true && this.hasErasedAll()) {
    //           this.cancelThisTool();
    //         }
    //         if (this.flyAroundEntitiesList().length > 1) {
    //           const pointEntity: Cesium.Entity | undefined =
    //             this.flyAroundEntitiesList()[this.flyAroundEntitiesList().length - 2]
    //               ?.defaultEntity;
    //           if (pointEntity && pointEntity instanceof Cesium.Entity) {
    //             if (pointEntity?.point) {
    //               pointEntity.point.color = Cesium.Color.CORNFLOWERBLUE.withAlpha(0.5);
    //             }
    //             if (pointEntity?.billboard) {
    //               pointEntity.billboard.color = Cesium.Color.CORNFLOWERBLUE.withAlpha(0.5);
    //             }
    //           }
    //         }
    //       });
    //     }
    //   } catch (error: unknown) {
    //     console.log(chalk.red(error));
    //   }
    // });

    // Отмена вращения при других операциях с камерой, сбивающих обзор цели, например, перелетах
    effect(() => {
      try {
        if (this.$viewerService.cameraIsFlyingAround() === false) {
          untracked(() => {
            if (this.isActive() === true) {
              this.cancelThisTool();
            }
          });
        }
      } catch (error: unknown) {
        console.log(chalk.red(error));
      }
    });
  }
  // private readonly flyAroundGroupsCounter = computed<number>(
  //   () => this.flyAroundEntitiesList().length,
  // );
  // private readonly hasErasedAll = linkedSignal<number, boolean>({
  //   source: this.flyAroundGroupsCounter,
  //   computation(newVal, prevVal) {
  //     return prevVal && !newVal ? true : false;
  //   },
  // });

  // Еще используется в flyAround.ts
  public cancelThisTool(): void {
    try {
      this.$cameraToolsService.cancelCameraTool(); // общая функция отмены сценария любого из инструментов работы с картой
    } catch (error: unknown) {
      console.log(chalk.red(error));
    } finally {
      this.drawingHasStarted.set(false);
      this.isActive.set(false);
      if (this.$cameraToolsService.flyAroundEntitiesList().length) {
        this.$cameraToolsService.allToolEntitiesCleaning(this.toolName);
      }
      this.stopFlyingAround();
    }
  }
  // ------------------ Блок логики автоматической деактивации инструмента (end) -------------------- //

  // -------------------------- Блок отработки кнопки инструмента (start) --------------------------- //
  // Еще используется в flyAround-floating-window.service.ts
  public readonly toolName: CameraToolName = 'flyAround';
  public readonly toolNameAlt: string = 'flyAroundWithoutPoint';

  public buttonHandler(event: MouseEvent): void {
    // event.stopPropagation(); // не применять! (событие также ловится в родителе (camera-tools.ts))
    if (event.button === 0) {
      this.toggleDrawing();
    } else if (event.button === 1) {
      this.cancelThisTool();
    }
  }
  private toggleDrawing(): void {
    try {
      if (this.isActive() === false && !this.drawingsBlocker()) {
        this.isActive.set(true);
        this.setFlyingAround({
          // -------------------------------------- //
          // Если необходима сущность на холсте
          destroy: false,
          withPoint: true,
          // withBillboard: true,
          toolName: this.toolName,
          name: getRusCameraToolName(this.toolName),
          clampToGround: true,
        });
      } else if (this.isActive() === true) {
        this.cancelThisTool();
      } else {
        console.log(chalk.red('Unexpected toggleDrawing try'));
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      this.cancelThisTool();
    }
  }
  // -------------------------- Блок отработки кнопки инструмента (end) ----------------------------- //

  // --------------------- Блок работы с Cesium-сущностями инструмента (start) ---------------------- //
  // Main-функция настоящего инструмента
  private setFlyingAround(options: CameraToolsOptions = {}): boolean {
    try {
      if (this.$toolsService.drawingsBlocker() === true) return false;
      this.$toolsService.clearCommonHandler();
      this.$toolsService.setDrawingsBlocker(true);

      let pointPos: Cesium.Cartesian3 | undefined = Cesium.Cartesian3.ZERO;

      // ------------------------------------------------------------------------- //
      // Если необходима сущность на холсте
      let pointEntity: Cesium.Entity | undefined;
      let groupIdChank: string;
      if (options?.groupId === undefined) {
        groupIdChank = `${Math.ceil(Math.random() * 1000000)}`;
      } else {
        groupIdChank = options.groupId;
      }
      const optForPoint: CameraToolsOptions = cloneDeep(options);
      // Начало id должно быть общим для суммы сущностей одного сценария работы инструмента
      optForPoint.id = `${groupIdChank}-${this.toolName}-point-${Math.ceil(Math.random() * 1000000)}`;
      // --------------------------------- //
      if (options?.withPoint || options?.withBillboard) {
        if (this.drawingHasStarted() === false) this.drawingHasStarted.set(true);
        if (this.$viewerService.entityPickingBlock() === false)
          this.$viewerService.onEntityPickingBlock();
        if (
          this.$cameraToolsService
            .temporalEntitiesList()
            .findIndex((item) => item?.id === optForPoint?.id) !== -1
        ) {
          throw new Error('Entity already exist in temporal store by setFlyingAround()');
        }
        if (options?.withPoint) {
          optForPoint.point = {
            show: true,
            pixelSize: 10,
            color: Cesium.Color.RED.withAlpha(0.5),
            outlineColor: Cesium.Color.WHITE.withAlpha(0.5),
            outlineWidth: 3,
            disableDepthTestDistance: undefined, // будет перекрываться рельефом (при clampToGround)
            // disableDepthTestDistance: Number.POSITIVE_INFINITY, // будет просвечивать сквозь рельеф
            // scaleByDistance: new Cesium.NearFarScalar(2414016, 1, 16093000, 0.1), // как в .kml
            // translucencyByDistance: new Cesium.NearFarScalar(3000000, 1, 5000000, 0),
            heightReference:
              options?.clampToGround === undefined
                ? undefined
                : options?.clampToGround
                  ? Cesium.HeightReference.CLAMP_TO_GROUND
                  : Cesium.HeightReference.NONE,
          };
        } else {
          // Либо point, либо billboard
          optForPoint.billboard = options?.billboard || {
            image: 'assets/planet/drawings-tools/map-position_white.png',
            height: 32, // как в .kml (оригинальный размер метки 64x64)
            width: 32,
            color: options?.color || Cesium.Color.CHOCOLATE.withAlpha(1),
            disableDepthTestDistance: undefined, // будет перекрываться рельефом (при clampToGround)
            // disableDepthTestDistance: Number.POSITIVE_INFINITY, // будет просвечивать сквозь рельеф
            pixelOffsetScaleByDistance: new Cesium.NearFarScalar(2414016, 1, 16093000, 0.1), // как в .kml
            scaleByDistance: new Cesium.NearFarScalar(2414016, 1, 16093000, 0.1), // как в .kml
            heightReference:
              options?.clampToGround === undefined
                ? undefined
                : options?.clampToGround
                  ? Cesium.HeightReference.CLAMP_TO_GROUND
                  : Cesium.HeightReference.NONE,
          };
        }
        pointEntity = this.$toolsService.setPointEntity(pointPos, optForPoint);
        if (pointEntity === undefined)
          throw new Error('Point entity is undefined in setFlyingAround fn');
        const reactivePointPos: Cesium.CallbackPositionProperty =
          new Cesium.CallbackPositionProperty(() => pointPos, false);
        if (pointEntity.position) pointEntity.position = reactivePointPos;
        if (optForPoint?.toolName) {
          // @ts-ignore (конфликт - кастомное свойство toolName)
          pointEntity.toolName = optForPoint.toolName;
        }

        this.$cameraToolsService.addNewEntityToCameraToolsLayer(pointEntity); // самоочистится при cancelThisTool()
        this.$cameraToolsService.temporalEntitiesList.update((arr) => [...arr, pointEntity]); // самоочистится при cancelThisTool()
      }
      // ------------------------------------------------------------------------- //

      // ЛКМ (получение точной координаты, вокруг которой будет происходить вращение)
      const startDrawing = async (): Promise<void> => {
        try {
          const mouseEntity: Cesium.Entity = await this.$toolsService.getMouseEntity();
          pointPos = mouseEntity?.position?.getValue();
          if (pointPos === undefined)
            throw new Error('Position arg is undefined in drawLineDrawingGraphics()');

          // ------------------------------------------------------------------------- //
          // Если необходима сущность на холсте
          if (options?.withPoint || options?.withBillboard) {
            if (pointEntity === undefined)
              throw new Error('Point entity is undefined in setFlyingAround fn');
            // Вариант 1: долговременно (удалить все потом можно по СКМ на кнопке инструмента)
            if (!options?.destroy) {
              this.$cameraToolsService.pushGroupFromTemporal(
                groupIdChank,
                optForPoint?.toolName,
                pointEntity,
              );
              this.$cameraToolsService.clearTemporalEntitiesList(groupIdChank);
              // this.$viewerService.setNewPickedEntity(pointEntity);
            } else {
              // Вариант 2: только на время выполнения отработки данного метода
              this.$cameraToolsService.removeTemporalEntities(groupIdChank);
            }
          }
          // ------------------------------------------------------------------------- //
          // Окончание построения без деактивации инструмента
          this.switchToFlying(pointPos);
          if (options?.callback && typeof options.callback === 'function') {
            options.callback();
          }
        } catch (error: unknown) {
          this.cancelThisTool();
          console.log(chalk.red(error));
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };

      if (options?.withPoint || options?.withBillboard) {
        this.$toolsService.createNewCommonHandler(this.toolName);
      } else {
        // this.toolNameAlt также добавлено в условия деактивации по Esc (в tools-panel.ts)
        this.$toolsService.createNewCommonHandler(this.toolNameAlt); // курсор останется обычным для инструментов ('crosshair')
      }
      this.$toolsService.setCommonHandler(startDrawing, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // ------------------------------------------------------------------------- //
      // Если необходима сущность на холсте
      // Перемещение курсора (редактирование позиции точки)
      const continueDrawing = async (): Promise<void> => {
        try {
          if (options?.withPoint || options?.withBillboard) {
            const mouseEntity: Cesium.Entity = await this.$toolsService.getMouseEntity(false);
            pointPos = mouseEntity?.position?.getValue();
          }
        } catch (error: unknown) {
          this.cancelThisTool();
          console.log(chalk.red(error));
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      this.$toolsService.setCommonHandler(continueDrawing, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      // ------------------------------------------------------------------------- //

      // ПКМ (отмена сценария)
      const finishDrawing = (): void => {
        try {
          this.cancelThisTool();
          return;
        } catch (error: unknown) {
          this.cancelThisTool();
          console.log(chalk.red(error));
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      this.$toolsService.setCommonHandler(finishDrawing, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

      return true;
    } catch (error: unknown) {
      this.cancelThisTool();
      console.log(chalk.red(error));
      alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
      return false;
    }
  }

  // Окончание построения без деактивации (ожидается вращение вокруг установленной позиции)
  private switchToFlying(cartesian: Cesium.Cartesian3): void {
    try {
      // Очистка стандартных флагов, блокираторов и хэндлеров
      this.$cameraToolsService.cancelCameraTool();
      this.flyAroundPosition(cartesian);
    } catch (error: unknown) {
      console.log(chalk.red(error));
    } finally {
      this.drawingHasStarted.set(false);
    }
  }

  private flyAroundPosition(cartesian: Cesium.Cartesian3) {
    try {
      if (!cartesian || !(cartesian instanceof Cesium.Cartesian3)) {
        throw new Error('Invalid position in flyAroundPosition fn');
      }
      // Определение зоны обзора в матрице, заданной в локальной системе координат (ENU)
      const centerPos = cartesian.clone();
      const enuTransform = Cesium.Transforms.eastNorthUpToFixedFrame(centerPos);
      const nowRange: number =
        Cesium.Cartesian3.distance(this.$viewerService.viewer.camera.position, centerPos) || 2900;
      // if (
      //   // 3D
      //   this.$viewerService.viewer.scene.mode === 3 ||
      //   // Columbus
      //   this.$viewerService.viewer.scene.mode === 1
      // ) {
      const nowHeading = this.$viewerService.viewer.camera.heading;
      const nowPitch = this.$viewerService.viewer.camera.pitch || -Math.PI / 8;
      this.$viewerService.viewer.scene.camera.lookAtTransform(
        enuTransform, // матрица 4x4
        new Cesium.HeadingPitchRange(nowHeading, nowPitch, nowRange), // центрирование на цели
      );
      // 2D
      // } else {
      //   this.$viewerService.viewer.scene.camera.lookAtTransform(enuTransform);
      // }

      if (this.$viewerService.cameraIsFlyingAround() === false) {
        // Запуск вращения
        const listenersCounterPrev = this.$viewerService.viewer.clock.onTick.numberOfListeners;
        this.$viewerService.viewer.clock.onTick.addEventListener(this.rotateCamera);
        const listenersCounterNext = this.$viewerService.viewer.clock.onTick.numberOfListeners;
        if (listenersCounterPrev < listenersCounterNext) {
          this.$viewerService.setCameraFlyingAroundFlag(true);
        } else {
          console.log(chalk.red('Rotation listener addition failed'));
          return false;
        }
      }
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      if (error instanceof Error) {
        console.log(error.stack);
      }
      return false;
    }
  }

  // FE применено для обеспечения возможности очистки лисенера с данным колбэком (причинаЖ вызов .bind(this) каждый раз создает новую функцию в оперативной памяти - removeEventListener вернет false)
  private rotateCamera = (): void => {
    try {
      this.$viewerService.viewer.scene.camera.rotateRight(0.003);
    } catch (error: unknown) {
      throw error;
    }
  };

  // Применяется при деактивации инструмента
  private stopFlyingAround(): boolean {
    try {
      const isRemoved: boolean = this.$viewerService.viewer.clock.onTick.removeEventListener(
        this.rotateCamera,
      );
      if (isRemoved) {
        this.$viewerService.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        this.$viewerService.setCameraFlyingAroundFlag(false);
        return true;
      } else {
        if (this.$viewerService.cameraIsFlyingAround() === true) {
          console.log(chalk.red("Flying around event listener has't removed"));
        }
        return false;
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }
  // --------------------- Блок работы с Cesium-сущностями инструмента (end) ------------------------ //
}
