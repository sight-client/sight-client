import { computed, effect, Injectable, signal, untracked, WritableSignal } from '@angular/core';
import chalk from 'chalk';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { MeasureService } from '@/common/services/measure-service/measure.service';
import type { ToolName } from '@/common/services/measure-service/measure.service';

interface MeasuringToolsModalItem {
  toolName: ToolName;
  collapsed: WritableSignal<boolean>;
  isActive: WritableSignal<boolean>;
  top: number;
}

@Injectable() // применение сервиса ограничено measuring-tools.ts
export class MeasuringToolsModalsService {
  constructor(
    private $viewerService: ViewerService,
    private $measureService: MeasureService,
  ) {
    // Notice: pickedEntity также обновляется при каждом успешном окончании сценария использования инструмента (заложено в функциях measure.service.ts)
    effect(() => {
      // @ts-ignore
      const activeToolName = this.$viewerService.viewer?.pickedEntity?.()?.toolName;
      if (activeToolName) {
        untracked(() => {
          if (
            // Применяется уже при наличии соответствующей модалки инструмента (первичная активация - в this.addModalItem)
            this.measuringToolsModalsList().findIndex(
              (item) => item?.toolName === activeToolName,
            ) !== -1
          ) {
            this.setActiveModal(activeToolName);
          }
        });
      }
    });
    effect(() =>
      this.isMarks() === true ? this.addModalItem('addMark') : this.deleteModalItem('addMark'),
    );
    effect(() =>
      this.isLines() === true
        ? this.addModalItem('linearMeasurements')
        : this.deleteModalItem('linearMeasurements'),
    );
    // ...другие инструменты
  }

  // Main-список для модалок и их табов
  public measuringToolsModalsList = signal<Array<MeasuringToolsModalItem | undefined>>([]);
  // Состояния наличия сущностей инструментов с модалками, отслеживаемое местными эффектами
  private isMarks = computed<boolean>(() => !!this.$measureService.marksList().length); // кэширует true (при продолжении добавления новых сущностей эффект уже не сработает)
  private isLines = computed<boolean>(
    () => !!this.$measureService.linearMesurmentsLinesList().length,
  );
  // ...другие инструменты

  // ------------------------------------------------------------------------------- //
  // Функции для эффектов (в конструкторе)
  // ------------------------------------------------------------------------------- //

  private addModalItem(toolName: ToolName): void {
    try {
      // т.к. участвует в effect (применено здесь, а не в effect для лаконичности написания последних)
      untracked(() => {
        this.clearOthersIsActiveFlags(toolName);
        const mainArrLength = this.measuringToolsModalsList().length;
        let newTop: number = -230;
        if (mainArrLength === 0) {
          newTop = -230;
        } else {
          if (this.measuringToolsModalsList()[mainArrLength - 1]?.top !== undefined) {
            newTop =
              this.measuringToolsModalsList()[mainArrLength - 1]!.top - this.modalHeaderHeight;
            // if (newTop > window.innerHeight - 300) {
            //   newTop = window.innerHeight - 300;
            // }
          }
        }
        this.measuringToolsModalsList.update((arr) => [
          ...arr,
          {
            toolName: toolName,
            collapsed: signal(false),
            isActive: signal(true), // модалка активна при создании
            top: newTop,
          },
        ]);
      });
    } catch (error: unknown) {
      console.log(chalk.red(error));
    }
  }
  private deleteModalItem(toolName: ToolName): void {
    try {
      // т.к. участвует в effect
      untracked(() => {
        const index: number = this.measuringToolsModalsList().findIndex(
          (item) => item?.toolName === toolName,
        );
        if (index !== -1) {
          this.measuringToolsModalsList.update((arr) => {
            arr.splice(index, 1);
            return [...arr];
          });
        }
      });
    } catch (error: unknown) {
      console.log(chalk.red(error));
    }
  }
  // ------------------------------------------------------------------------------- //
  // Функции управлением состоянием отображения модалок
  // ------------------------------------------------------------------------------- //

  public collapseModal(index: number | undefined, event: MouseEvent): boolean {
    try {
      event.stopPropagation();
      if (index === undefined) {
        console.log(chalk.red('Index is undefined in collapseModal fn'));
        return false;
      }
      if (this.measuringToolsModalsList()[index]?.collapsed() === false) {
        this.measuringToolsModalsList()[index]!.collapsed.set(true);
        return true;
      } else {
        return false;
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }
  public expandModal(index: number): boolean {
    try {
      if (index === undefined) {
        console.log(chalk.red('Index is undefined in expandModal fn'));
        return false;
      }
      if (this.measuringToolsModalsList()[index]?.collapsed() === true) {
        this.measuringToolsModalsList()[index]!.collapsed.set(false);
        if (this.measuringToolsModalsList()[index]?.toolName) {
          this.setActiveModal(this.measuringToolsModalsList()[index]!.toolName);
        }
        return true;
      } else {
        return false;
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }
  public clearModalsEntities(parentName: ToolName, event: MouseEvent): boolean {
    try {
      event.stopPropagation();
      if (parentName === undefined) {
        console.log(chalk.red('Parent name is undefined in clearModalsEntities fn'));
        return false;
      } else {
        return this.$measureService.allToolEntitiesCleaning(parentName);
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  /* 
  Итого, isActive-флаг модалки контролируется:
  - в местных addModalItem - при создании модалки;
  - в местном effect - при добавлении новых сущностей инструмента модалки на холст и при выборе уже существующих;
  - в местной expandModal - при разворачивании модалки из табов;
  - в переиспользуемом шаблоне модалки - по mousedown на модалку;
  - в местных deleteModalItem и collapseModal не учтен намеряно.
  */
  setActiveModal(toolName: ToolName): boolean {
    try {
      const index = this.measuringToolsModalsList().findIndex(
        (item) => item?.toolName === toolName,
      );
      if (index !== -1) {
        if (this.measuringToolsModalsList()[index]?.isActive() === false) {
          this.measuringToolsModalsList()[index]?.isActive.set(true);
          this.clearOthersIsActiveFlags(toolName);
          return true;
        } else return false;
      } else {
        console.log(chalk.red(`${toolName}-modal has not found in setActiveModal fn`));
        return false;
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }
  private clearOthersIsActiveFlags(toolName: ToolName): boolean {
    try {
      for (const item of this.measuringToolsModalsList()) {
        if (item?.toolName !== toolName) {
          item?.isActive.set(false);
        }
      }
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  // Определение размера вертикального отступа новой модалки (приходит из measuring-tools-modal.ts)
  declare public modalHeaderHeight: number;
  public getModalHeaderHeight(val: string): boolean {
    try {
      if (this.modalHeaderHeight === undefined && val.endsWith('px')) {
        this.modalHeaderHeight = +val.slice(0, -2);
        return true;
      } else return false;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }
}
