import { reportError } from '@global/lib/report-error.lib';
import { computed, effect, Injectable, linkedSignal, untracked } from '@angular/core';

import { FloatingWindowsService } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';
import { MeasureService } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import type { MeasuringToolName } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import { CalculateLineService } from '@/components/tools/measuring-tools/components/calculate-line/services/calculate-line-service/calculate-line.service';

// Запровайден в measuring-tools-floating-windows.ts
@Injectable()
export class CalculateLineFloatingWindowService {
  constructor(
    private $floatingWindowsService: FloatingWindowsService,
    private $measureService: MeasureService,
    private $calculateLineService: CalculateLineService,
  ) {
    effect(() => {
      try {
        if (this.$calculateLineService.validPickedEnttity() !== undefined) {
          untracked(() => {
            // Выявляет необходимость возможного перерасчета при последующем включении чекбокса
            if (
              !this.$calculateLineService.validPickedEnttity()?.id?.includes('-mostDetailed-')
            ) {
              this.$calculateLineService.setRecalculationFlag(true);
            }
          });
        }
      } catch (error: unknown) {
        reportError(error);
      }
    });

    // --------------------- Блок стандартных для окон инструментов методов и состояний (start) --------------------- //
    this.toolName = this.$calculateLineService.toolName;
    // Deprecated (окно появляется до создания сущностей инструмента на холсте)
    // // Существование окна по условию наличия сущностей его инструмента
    effect(() => {
      try {
        if (this.$measureService.isLines() === true) {
          untracked(() => {
            this.$floatingWindowsService.addWindowItem(this.toolName);
          });
        } else {
          untracked(() => {
            this.$floatingWindowsService.deleteWindowItem(this.toolName);
          });
        }
      } catch (error: unknown) {
        reportError(error);
      }
    });

    // Freezed
    // Добавление или показ окна по активации (кнопке) инструмента (до построения первой сущности) по причине наличия опций построения
    // effect(() => {
    //   try {
    //     if (this.$calculateLineService.isActive() === true) {
    //       untracked(() => {
    //         const index = this.$floatingWindowsService
    //           .floatingWindowsList()
    //           .findIndex((item) => item?.windowName === this.toolName);
    //         // Если окно скрыто в табы
    //         if (index !== -1) {
    //           this.$floatingWindowsService.showActiveWindow(this.toolName, undefined, index);
    //         } else {
    //           if (!this.$measureService.linearMeasurmentsLinesList().length) {
    //             this.$floatingWindowsService.addWindowItem(this.toolName);
    //           }
    //         }
    //       });
    //     }
    //   } catch (error: unknown) {
    //     reportError(error);
    //   }
    // });
    // Удаление окна вместе с последней относящейся к нему сущностью
    effect(() => {
      try {
        if (this.$calculateLineService.hasErasedAll() === true) {
          untracked(() => {
            this.$floatingWindowsService.deleteWindowItem(this.toolName);
          });
        }
      } catch (error: unknown) {
        reportError(error);
      }
    });
    // Deprecated (на текущий момент для мерителей поддерживается только единоразовый сценарий использования)
    // Показ (без добавления) окна по построению очередной сущности
    // effect(() => {
    //   try {
    //     if (this.$measureService.isLines() === true) {
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
    //     reportError(error);
    //   }
    // });
    // // Сокрытие (без удаления) окна при удалении активной (отображаемой в нем) сущности
    // effect(() => {
    //   try {
    //     if (this.$calculateLineService.linearMeasurmentsLinesList().length) {
    //       untracked(() => {
    //         if (this._validPickedEnttity()) {
    //         const nowGroupId: string | undefined = this._validPickedEnttity()?.id.split('-')[0];
    //         const index = this.$calculateLineService
    //           .linearMeasurmentsLinesList()
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
            this.$calculateLineService.nullAllToolSettigs();
            if (this.$measureService.isLines() === true) {
              this.$measureService.allToolEntitiesCleaning(this.toolName);
            }
            if (
              this.$calculateLineService.measureHasStarted() ||
              this.$calculateLineService.isActive()
            ) {
              this.$calculateLineService.cancelThisTool();
            }
          });
        }
      } catch (error: unknown) {
        reportError(error);
      }
    });
  }
  // Еще используется в calculate-line-floating-window.html
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

  // Отлов сущности, соответствующей данному плавающему окну,
  // для отображения в нем (исключение вспомогательных сущностей в группе)
  // перенесен в calculate-line.service (для удобства перерасчетов)
  // --------------------- Блок стандартных для окон инструментов методов и состояний (end) ----------------------- //
}
