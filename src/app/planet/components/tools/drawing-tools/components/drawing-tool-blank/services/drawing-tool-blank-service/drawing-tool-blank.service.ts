import { reportError } from '@global/lib/report-error.lib';
import { Injectable, computed, effect, linkedSignal, signal, untracked } from '@angular/core';
import * as Cesium from 'cesium';
import cloneDeep from 'lodash/cloneDeep';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import {
  DrawingService,
  getRusDrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import type {
  DrawingOptions,
  DrawingToolName,
} from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
// import * as MeasuresLib from '@/components/tools/lib/basic-measure-calculations.lib';

// Запровайден в planet.ts
@Injectable()
export class DrawingToolBlankService {
  // --------------------- Блок для хранения основных состояний сервиса (start) ----------------------- //
  // Еще используется в drawing-tool-blank-floating-window.ts
  public readonly drawingToolBlankList = computed(() =>
    this.$drawingService.drawingToolBlankList(),
  );
  // Еще используется в drawing-tool-blank.ts
  public readonly drawingsBlocker = computed(() => this.$toolsService.drawingsBlocker());
  private _isActive = signal<boolean>(false);
  // Еще используется в drawing-tool-blank.ts
  get isActive() {
    return this._isActive;
  }
  private drawingHasStarted = signal<boolean>(false);
  // --------------------- Блок для хранения основных состояний сервиса (end) ------------------------- //
  constructor(
    private $viewerService: ViewerService,
    private $drawingService: DrawingService,
    private $toolsService: ToolsService,
  ) {
    // ------------------ Блок логики автоматической деактивации инструмента (start) ------------------ //
    effect(() => {
      try {
        if (this.drawingToolBlankList()) {
          untracked(() => {
            if (this.isActive() === true && this.hasErasedAll()) {
              this.cancelThisTool();
            }
          });
        }
      } catch (error: unknown) {
        reportError(error);
      }
    });
  }
  private readonly drawingToolBlankGroupsCounter = computed<number>(
    () => this.drawingToolBlankList().length,
  );
  private readonly hasErasedAll = linkedSignal<number, boolean>({
    source: this.drawingToolBlankGroupsCounter,
    computation(newVal, prevVal) {
      return prevVal && !newVal ? true : false;
    },
  });
  // Еще используется в drawing-tool-blank.ts
  public cancelThisTool(): void {
    try {
      this.$drawingService.cancelDrawingTool(); // общая функция отмены сценария любого из инструментов работы с картой
    } catch (error: unknown) {
      reportError(error);
    } finally {
      this.drawingHasStarted.set(false);
      this.isActive.set(false);
    }
  }
  // ------------------ Блок логики автоматической деактивации инструмента (end) -------------------- //

  // -------------------------- Блок отработки кнопки инструмента (start) --------------------------- //
  // Еще используется в drawing-tool-blank-floating-window.service.ts
  public readonly toolName: DrawingToolName = 'drawingToolBlank';
  // Используется в drawing-tool-blank.ts
  public buttonHandler(event: MouseEvent): void {
    // event.stopPropagation(); // не применять! (событие также ловится в родителе (drawing-tools.ts))
    if (event.button === 0) {
      this.toggleDrawing();
    } else if (event.button === 1) {
      if (this.drawingHasStarted() === false) {
        this.$drawingService.allToolEntitiesCleaning(this.toolName); // cancelThisTool() сработает по эффекту
      } else {
        this.$drawingService.removeTemporalEntities();
        if (this.drawingToolBlankGroupsCounter()) {
          this.$drawingService.allToolEntitiesCleaning(this.toolName);
        } else this.cancelThisTool();
      }
    }
  }
  private toggleDrawing(): void {
    try {
      if (this.isActive() === false && !this.drawingsBlocker()) {
        this.isActive.set(true);
        this.mainFunction({
          toolName: this.toolName,
          name: getRusDrawingToolName(this.toolName),
          clampToGround: true,
          reuse: true,
        });
      } else if (this.isActive() === true) {
        if (this.drawingHasStarted() === true) {
          this.$drawingService.removeTemporalEntities();
        }
        this.cancelThisTool();
      }
    } catch (error: unknown) {
      reportError(error);
      this.cancelThisTool();
    }
  }
  // -------------------------- Блок отработки кнопки инструмента (end) ----------------------------- //

  // --------------------- Блок работы с Cesium-сущностями инструмента (start) ---------------------- //
  // Main-функция настоящего инструмента
  private mainFunction(options: DrawingOptions = {}): boolean {
    try {
      console.info('Старт нового сценария');
      if (this.$toolsService.drawingsBlocker() === true) return false;
      this.$toolsService.clearCommonHandler();
      this.$toolsService.setDrawingsBlocker(true);
      let groupIdChunk: string;
      if (options?.groupId === undefined) {
        groupIdChunk = `${Math.ceil(Math.random() * 1000000)}`;
      } else {
        groupIdChunk = options.groupId;
      }
      const optForPoint: DrawingOptions = cloneDeep(options);
      // Начало id должно быть общим для суммы сущностей одного сценария работы инструмента
      optForPoint.id = `${groupIdChunk}-${this.toolName}-point-${Math.ceil(Math.random() * 1000000)}`;
      const optForLine: DrawingOptions = cloneDeep(options);
      optForLine.id = `${groupIdChunk}-${this.toolName}-line-${Math.ceil(Math.random() * 1000000)}`;
      if (options?.name) optForPoint.name = options.name + ' ' + groupIdChunk;
      if (options?.name) optForLine.name = options.name + ' ' + groupIdChunk;

      // ...логика, характерная для настоящего инструмента

      // ЛКМ (...описание ожиданий)
      const startDrawing = (): void => {
        try {
          if (this.drawingHasStarted() === false) this.drawingHasStarted.set(true);
          if (this.$viewerService.entityPickingBlock() === false)
            this.$viewerService.onEntityPickingBlock();

          // ...логика, характерная для настоящего инструмента
          console.info('left click');
        } catch (error: unknown) {
          this.cancelThisTool();
          reportError(error);
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      this.$toolsService.createNewCommonHandler(this.toolName);
      this.$toolsService.setCommonHandler(startDrawing, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // Перемещение курсора (...описание ожиданий)
      const continueDrawing = (): void => {
        try {
          // ...логика, характерная для настоящего инструмента
          if (true) console.info('mouse move');
        } catch (error: unknown) {
          this.cancelThisTool();
          reportError(error);
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      this.$toolsService.setCommonHandler(continueDrawing, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      // ПКМ (...описание ожиданий)
      const finishDrawing = (): void => {
        try {
          if (this.drawingHasStarted() === false) {
            console.info('Отмена сценария');
            this.cancelThisTool();
            return;
          }

          this.$viewerService.offEntityPickingBlock();

          // ...логика, характерная для настоящего инструмента
          console.info('right click');

          this.$toolsService.setDrawingsBlocker(false);
          if (options?.callback && typeof options.callback === 'function') {
            options.callback();
          }
          if (this.drawingHasStarted() === true) this.drawingHasStarted.set(false);
          console.info('Окончание сценария');
          if (options.reuse === true) {
            this.mainFunction(options);
          } else this.cancelThisTool();
        } catch (error: unknown) {
          this.cancelThisTool();
          reportError(error);
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      this.$toolsService.setCommonHandler(finishDrawing, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

      return true;
    } catch (error: unknown) {
      this.cancelThisTool();
      reportError(error);
      alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
      return false;
    }
  }
  // --------------------- Блок работы с Cesium-сущностями инструмента (end) ------------------------ //
}
