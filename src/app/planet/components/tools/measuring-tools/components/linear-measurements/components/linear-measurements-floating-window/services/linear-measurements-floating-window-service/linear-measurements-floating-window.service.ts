import { computed, effect, Injectable, linkedSignal, untracked } from '@angular/core';
import chalk from 'chalk';

import { FloatingWindowsService } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';
import { MeasureService } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import type { MeasuringToolName } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import { LinearMeasurementsService } from '@/components/tools/measuring-tools/components/linear-measurements/services/linear-measurements-service/linear-measurements.service';

// Запровайден в measuring-tools-floating-windows.ts
@Injectable()
export class LinearMeasurementsFloatingWindowService {
  constructor(
    private $floatingWindowsService: FloatingWindowsService,
    private $measureService: MeasureService,
    private $linearMeasurementsService: LinearMeasurementsService,
  ) {
    effect(() => {
      try {
        if (this.$linearMeasurementsService.validPickedEnttity() !== undefined) {
          untracked(() => {
            // Выявляет необходимость возможного перерасчета при последующем включении чекбокса
            if (
              !this.$linearMeasurementsService.validPickedEnttity()?.id?.includes('-mostDetailed-')
            ) {
              this.$linearMeasurementsService.setRecalculationFlag(true);
            }
          });
        }
      } catch (error: unknown) {
        console.log(chalk.red(error));
      }
    });

    // --------------------- Блок стандартных для окон инструментов методов и состояний (start) --------------------- //
    this.toolName = this.$linearMeasurementsService.toolName;
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
        console.log(chalk.red(error));
      }
    });

    // Freezed
    // Добавление или показ окна по активации (кнопке) инструмента (до построения первой сущности) по причине наличия опций построения
    // effect(() => {
    //   try {
    //     if (this.$linearMeasurementsService.isActive() === true) {
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
    //     console.log(chalk.red(error));
    //   }
    // });
    // Удаление окна вместе с последней относящейся к нему сущностью
    effect(() => {
      try {
        if (this.$linearMeasurementsService.hasErasedAll() === true) {
          untracked(() => {
            this.$floatingWindowsService.deleteWindowItem(this.toolName);
          });
        }
      } catch (error: unknown) {
        console.log(chalk.red(error));
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
    //     console.log(chalk.red(error));
    //   }
    // });
    // // Сокрытие (без удаления) окна при удалении активной (отображаемой в нем) сущности
    // effect(() => {
    //   try {
    //     if (this.$linearMeasurementsService.linearMeasurmentsLinesList().length) {
    //       untracked(() => {
    //         if (this._validPickedEnttity()) {
    //         const nowGroupId: string | undefined = this._validPickedEnttity()?.id.split('-')[0];
    //         const index = this.$linearMeasurementsService
    //           .linearMeasurmentsLinesList()
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
            this.$linearMeasurementsService.nullAllToolSettigs();
            if (this.$measureService.isLines() === true) {
              this.$measureService.allToolEntitiesCleaning(this.toolName);
            }
            if (
              this.$linearMeasurementsService.measureHasStarted() ||
              this.$linearMeasurementsService.isActive()
            ) {
              this.$linearMeasurementsService.cancelThisTool();
            }
          });
        }
      } catch (error: unknown) {
        console.log(chalk.red(error));
      }
    });
  }
  // Еще используется в linear-measurements-floating-window.html
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
  // перенесен в linear-measurements.service (для удобства перерасчетов)
  // --------------------- Блок стандартных для окон инструментов методов и состояний (end) ----------------------- //
}
