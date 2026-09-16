import { effect, Injectable, signal, untracked, WritableSignal } from '@angular/core';
import chalk from 'chalk';

import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { ToolsListService } from '@/components/tools/tools-list/services/tools-list-service/tools-list.service';
import { measuringToolsNames } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import type { MeasuringToolName } from '@/components/tools/measuring-tools/services/measure-service/measure.service';

export type WindowName = string;

export interface FloatingWindowItem {
  windowName: WindowName;
  collapsed: WritableSignal<boolean>;
  hidden: WritableSignal<boolean>;
  isActive: WritableSignal<boolean>;
  top: number;
  right?: number;
}

// Запровайден в planet.ts
@Injectable()
export class FloatingWindowsService {
  constructor(
    private readonly $viewerService: ViewerService,
    protected readonly $toolsListService: ToolsListService,
  ) {
    // Отслеживает выбор по ЛКМ любой сущности на холсте, ВКЛЮЧАЯ ПОВТОРЫ (для восстановления окна из инвиза)
    effect(() => {
      try {
        if (this.$viewerService.forcedEntityPickingEffectFlag() !== undefined) {
          untracked(() => {
            const forcedPickedToolName =
              // @ts-ignore (конфликт - кастомное свойство toolName)
              this.$viewerService?.viewer?.forcedPickedEntity?.()?.toolName;
            if (!forcedPickedToolName) return;
            if (
              this._floatingWindowsList().findIndex(
                (item) => item?.windowName === forcedPickedToolName,
              ) !== -1
            ) {
              this.setActiveWindow(forcedPickedToolName);
              // console.log(this.$viewerService?.viewer?.forcedPickedEntity?.());
            }
          });
        }
      } catch (error: unknown) {
        console.log(chalk.red(error));
      }
    });
  }

  // ------------------------------------------------------------------------------- //
  // Методы управления массивом объектов плавающих окон
  // ------------------------------------------------------------------------------- //

  // Main-список для плавающих окон и их табов
  private _floatingWindowsList = signal<Array<FloatingWindowItem | undefined>>([]);
  // Еще используется в сервисах плавающих окон инструментов работы с картой
  get floatingWindowsList() {
    return this._floatingWindowsList;
  }

  // Используется в сервисах инструментов правой панели и пр.
  public addWindowItem(windowName: WindowName): void {
    try {
      // т.к. участвует в effect'ах (резервное применение)
      untracked(() => {
        this.clearOthersIsActiveFlags(windowName);
        const mainArrLength = this._floatingWindowsList().length;
        let newTop: number = 33 + this._windowHeaderHeight;
        if (mainArrLength !== 0) {
          if (this._floatingWindowsList()[mainArrLength - 1]?.top !== undefined) {
            if (this._floatingWindowsList()?.[mainArrLength - 1]?.top) {
              newTop =
                this._floatingWindowsList()[mainArrLength - 1]!.top + this._windowHeaderHeight;
            }
          }
        }
        if (newTop > window.innerHeight - 300) {
          newTop = window.innerHeight - 300;
        }
        if (newTop < 0) {
          newTop = 0;
        }
        this._floatingWindowsList.update((arr) => [
          ...arr,
          {
            windowName: windowName,
            collapsed: signal(false),
            hidden: signal(false),
            isActive: signal(true), // окно активно при создании
            top: newTop,
            right: 33,
          },
        ]);
        // // Для тестов
        // for (let i = 0; i < this._floatingWindowsList().length; i++) {
        //   if (i === 4) {
        //     for (const item of this._floatingWindowsList()) {
        //       console.log(item?.windowName, item?.isActive());
        //     }
        //   }
        // }
      });
    } catch (error: unknown) {
      console.log(chalk.red(error));
    }
  }
  // Используется в сервисах инструментов правой панели и пр.
  public deleteWindowItem(windowName: WindowName, event?: MouseEvent): void {
    try {
      // т.к. участвует в effect'ах (резервное применение)
      untracked(() => {
        if (event) event.stopPropagation();
        const index: number = this._floatingWindowsList().findIndex(
          (item) => item?.windowName === windowName,
        );
        if (index !== -1) {
          this._floatingWindowsList.update((arr) => {
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
  // Методы управления состоянием отображения плавающих окон
  // ------------------------------------------------------------------------------- //

  // Используется в floating-window.html
  public collapseWindow(index: number | undefined, event: MouseEvent): boolean {
    try {
      event.stopPropagation();
      if (index === undefined) {
        console.log(chalk.red('Index is undefined in collapseWindow fn'));
        return false;
      }
      if (this._floatingWindowsList()[index]?.collapsed() === false) {
        this._floatingWindowsList()[index]!.collapsed.set(true);
      }
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }
  // Используется в floating-windows-tabs-panel.html
  public expandWindow(index: number, event?: MouseEvent): boolean {
    try {
      if (event) event.stopPropagation();
      if (index === undefined) {
        console.log(chalk.red('Index is undefined in expandWindow fn'));
        return false;
      }
      if (this._floatingWindowsList()[index]?.collapsed() === true) {
        this._floatingWindowsList()[index]!.collapsed.set(false);
      }
      if (this._floatingWindowsList()[index]?.hidden() === true) {
        this._floatingWindowsList()[index]!.hidden.set(false);
      }
      if (this._floatingWindowsList()[index]?.windowName) {
        this.setActiveWindow(this._floatingWindowsList()[index]!.windowName);
      }
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  public hideWindow(index: number, event?: MouseEvent): boolean {
    try {
      if (event) event.stopPropagation();
      if (index === undefined) {
        console.log(chalk.red('Index is undefined in hideWindow fn'));
        return false;
      }
      if (
        measuringToolsNames?.length &&
        measuringToolsNames.includes(
          this._floatingWindowsList()[index]?.windowName as MeasuringToolName,
        )
      ) {
        console.log('measuring tool has hiden');
      }
      if (this._floatingWindowsList()[index]?.hidden() === false) {
        this._floatingWindowsList()[index]!.hidden.set(true);
      }
      if (this._floatingWindowsList()[index]?.collapsed() === true) {
        this._floatingWindowsList()[index]!.collapsed.set(false);
      }
      if (this?.$toolsListService !== undefined) {
        this.checkActiveInToolsList(undefined, index);
      }
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  // Используется в эффектах сервисов плавающих окон инструментов (при удалении отображаемой сущности)
  public hideWindowByToolName(windowName: WindowName, event?: MouseEvent): boolean {
    try {
      if (event) event.stopPropagation();
      const index = this._floatingWindowsList().findIndex(
        (item) => item?.windowName === windowName,
      );
      if (index !== -1) {
        if (this._floatingWindowsList()[index]?.hidden() === false) {
          this._floatingWindowsList()[index]!.hidden.set(true);
        }
        if (this._floatingWindowsList()[index]?.collapsed() === true) {
          this._floatingWindowsList()[index]!.collapsed.set(false);
        }
        if (this?.$toolsListService !== undefined) {
          this.checkActiveInToolsList(windowName, undefined);
        }
        return true;
      } else {
        console.log(
          chalk.red(`Floating window "${windowName}" has not found in hideWindowByToolName fn`),
        );
        console.trace();
        return false;
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  // Результат - для шаблона tools-list.ts
  private checkActiveInToolsList(windowName?: WindowName, index?: number): boolean {
    try {
      if (this?.$toolsListService === undefined) {
        console.log(chalk.red('ToolsListService is undefined in checkActiveInToolsList fn'));
        return false;
      }
      if (!windowName && index === undefined) {
        console.log(
          chalk.red("WindowName and it's index are undefined in checkActiveInToolsList fn"),
        );
        return false;
      }
      if (windowName) {
        for (const store of this.$toolsListService.drawingStores) {
          if (store.storeName === windowName && store.activeObjInStore) {
            store.activeObjInStore.set(undefined);
            return true;
          }
        }
      } else {
        if (typeof index === 'number') {
          const windowNameFounded = this._floatingWindowsList()[index]?.windowName;
          for (const store of this.$toolsListService.drawingStores) {
            if (store.storeName === windowNameFounded && store.activeObjInStore) {
              store.activeObjInStore.set(undefined);
              return true;
            }
          }
        } else {
          console.log(chalk.red('Invalid index in checkActiveInToolsList fn'));
          return false;
        }
      }
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  /* 
  Итого, isActive-флаг окна контролируется:
  - в местных addWindowItem - при создании окна;
  - в местном effect - при добавлении новых сущностей инструмента окна на холст;
  - в местной expandWindow - при разворачивании окна из табов;
  - в переиспользуемом шаблоне окна - по mousedown на окне;
  - в местных deleteWindowItem и collapseWindow не учтен намеряно.
  */

  // Еще используется в floating-window.html
  public setActiveWindow(windowName: WindowName, event?: MouseEvent): boolean {
    try {
      if (event) event.stopPropagation();
      const index = this._floatingWindowsList().findIndex(
        (item) => item?.windowName === windowName,
      );
      if (index !== -1) {
        if (this._floatingWindowsList()[index]?.collapsed() === true) {
          this._floatingWindowsList()[index]!.collapsed.set(false);
        }
        if (this._floatingWindowsList()[index]?.hidden() === true) {
          this._floatingWindowsList()[index]!.hidden.set(false);
        }
        if (this._floatingWindowsList()[index]?.isActive() === false) {
          this._floatingWindowsList()[index]?.isActive.set(true);
          this.clearOthersIsActiveFlags(windowName);
        }
        return true;
      } else {
        console.log(
          chalk.red(`Floating window "${windowName}" has not found in setActiveWindow fn`),
        );
        return false;
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }
  public unsetActiveForAllWindows(): boolean {
    try {
      if (!this._floatingWindowsList().length) return false;
      this._floatingWindowsList().forEach((item) => {
        if (item?.isActive) item.isActive.set(false);
      });
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }
  // Используется в сервисах плавающих окон инструментов, где окна доступны уже по их активации (без создания первой сущности)
  public showActiveWindow(windowName: WindowName, event?: MouseEvent, indexVal?: number): boolean {
    try {
      if (event) event.stopPropagation();
      let index: number;
      if (indexVal !== undefined && indexVal !== -1) {
        index = indexVal;
      } else {
        index = this._floatingWindowsList().findIndex((item) => item?.windowName === windowName);
      }
      if (index !== -1) {
        if (this._floatingWindowsList()[index]?.collapsed() === true) {
          this._floatingWindowsList()[index]!.collapsed.set(false);
        }
        if (this._floatingWindowsList()[index]?.hidden() === true) {
          this._floatingWindowsList()[index]!.hidden.set(false);
        }
        if (this._floatingWindowsList()[index]?.isActive() === false) {
          this._floatingWindowsList()[index]?.isActive.set(true);
          this.clearOthersIsActiveFlags(windowName);
        }
        return true;
      } else {
        console.log(
          chalk.red(`Floating window "${windowName}" has not found in setActiveWindow fn`),
        );
        return false;
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  private clearOthersIsActiveFlags(windowName: WindowName): boolean {
    try {
      for (const item of this._floatingWindowsList()) {
        if (item?.windowName !== windowName) {
          item?.isActive.set(false);
        }
      }
      return true;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  // Определение размера вертикального отступа нового окна (приходит из floating-window.ts при создании его экземпляра)
  private _windowHeaderHeight: number = 32;
  // Еще используется в floating-window.ts
  get windowHeaderHeight() {
    return this._windowHeaderHeight;
  }

  // Единоразово используется в floating-window.ts
  public getWindowHeaderHeight(val: string): boolean {
    try {
      if (val.endsWith('px') && this._windowHeaderHeight + 'px' !== val) {
        this._windowHeaderHeight = +val.slice(0, -2);
        return true;
      } else return false;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }
}
