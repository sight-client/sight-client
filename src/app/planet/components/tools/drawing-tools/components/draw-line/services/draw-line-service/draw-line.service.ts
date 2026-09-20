import { Injectable, computed, effect, linkedSignal, signal, untracked } from '@angular/core';
import * as Cesium from 'cesium';
import chalk from 'chalk';
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
// import * as Humanify from '@/common/lib/humanify.lib';
// import { MatCheckboxChange } from '@angular/material/checkbox';

// Запровайден в planet.ts
@Injectable()
export class DrawLineService {
  constructor(
    private $viewerService: ViewerService,
    private $drawingService: DrawingService,
    private $toolsService: ToolsService,
  ) {
    // ------------------ Блок логики автоматической деактивации инструмента (start) ------------------ //
    effect(() => {
      try {
        if (this.drawLineEntitiesList()) {
          untracked(() => {
            if (this.hasErasedAll()) {
              this.counter = 0;
              if (this.isActive() === true) {
                this.cancelThisTool();
              }
            }
          });
        }
      } catch (error: unknown) {
        console.log(chalk.red(error));
      }
    });
  }
  private readonly linesGroupsCounter = computed<number>(() => this.drawLineEntitiesList().length);
  public readonly hasErasedAll = linkedSignal<number, boolean>({
    source: this.linesGroupsCounter,
    computation(newVal, prevVal) {
      return prevVal && !newVal ? true : false;
    },
  });
  // Еще используется в draw-line.ts
  public cancelThisTool(): void {
    try {
      if (this._isActive() && this.counter > 0) this.counter--;
      this.$drawingService.cancelDrawingTool(); // общая функция отмены сценария любого из инструментов работы с картой
    } catch (error: unknown) {
      console.log(chalk.red(error));
    } finally {
      this._drawingHasStarted.set(false);
      this.isActive.set(false);
    }
  }
  // ------------------ Блок логики автоматической деактивации инструмента (end) -------------------- //

  // --------------------- Блок для хранения основных состояний сервиса (start) ----------------------- //
  // Еще используется в draw-line-floating-window.ts
  public readonly drawLineEntitiesList = computed(() => this.$drawingService.drawLineEntitiesList());
  // Еще используется в draw-line.ts
  public readonly drawingsBlocker = computed(() => this.$toolsService.drawingsBlocker());
  private _isActive = signal<boolean>(false);
  // Еще используется в draw-line.ts
  get isActive() {
    return this._isActive;
  }
  private _drawingHasStarted = signal<boolean>(false);
  get drawingHasStarted() {
    return this._drawingHasStarted;
  }
  // --------------------- Блок для хранения основных состояний сервиса (end) ------------------------- //

  // -------------------------- Блок отработки кнопки инструмента (start) --------------------------- //
  // Еще используется в draw-line-floating-window.service.ts
  public readonly toolName: DrawingToolName = 'drawLine';
  // Используется в draw-line.ts
  public buttonHandler(event: MouseEvent): void {
    // event.stopPropagation(); // не применять! (событие также ловится в родителе (drawing-tools.ts))
    if (event.button === 0) {
      this.toggleDrawing();
    } else if (event.button === 1) {
      if (this._drawingHasStarted() === false) {
        this.$drawingService.allToolEntitiesCleaning(this.toolName); // cancelThisTool() сработает по эффекту
      } else {
        this.$drawingService.removeTemporalEntities();
        if (this.linesGroupsCounter()) {
          this.$drawingService.allToolEntitiesCleaning(this.toolName);
        } else this.cancelThisTool();
      }
    }
  }
  private toggleDrawing(): void {
    try {
      if (this.isActive() === false && !this.drawingsBlocker()) {
        this.isActive.set(true);
        this.drawLineDrawingGraphics({
          toolName: this.toolName,
          name: getRusDrawingToolName(this.toolName),
          reuse: true,
          randomColor: false,
          clampToGround: true,
          properties: {
            lineColor: undefined,
            numericId: undefined,
          },
        });
      } else if (this.isActive() === true) {
        if (this._drawingHasStarted() === true) {
          this.$drawingService.removeTemporalEntities();
        }
        this.cancelThisTool();
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      this.cancelThisTool();
    }
  }
  // -------------------------- Блок отработки кнопки инструмента (end) ----------------------------- //

  // --------------------- Блок работы с Cesium-сущностями инструмента (start) ---------------------- //
  private counter: number = 0;
  // Main-функция инструмента draw-line.ts
  private drawLineDrawingGraphics(options: DrawingOptions = {}): boolean {
    try {
      if (this.$toolsService.drawingsBlocker() === true) return false;
      this.$toolsService.clearCommonHandler();
      this.$toolsService.setDrawingsBlocker(true);
      let groupIdChank: string;
      if (options?.groupId === undefined) {
        groupIdChank = `${Math.ceil(Math.random() * 1000000)}`;
      } else {
        groupIdChank = options.groupId;
      }
      const optForPoint: DrawingOptions = cloneDeep(options);
      optForPoint.id = `${groupIdChank}-${this.toolName}-point-${Math.ceil(Math.random() * 1000000)}`;
      if (options?.name) optForPoint.name = options.name + ' ' + '(auxiliary)' + ' ' + groupIdChank;
      const optForLine: DrawingOptions = cloneDeep(options);
      optForLine.id = `${groupIdChank}-${this.toolName}-line-${Math.ceil(Math.random() * 1000000)}`;
      this.counter++;
      optForLine.name = `${options.name || getRusDrawingToolName(this.toolName)} ${this.counter}`;
      const labelText = optForLine.name;
      const labelTextGag: string = 'Ожидание окончания построения...';
      if (optForLine?.label) {
        optForLine.label.text = this.$toolsService.isMobile ? labelTextGag : labelText;
        optForLine.label.show = false;
      } else {
        optForLine.label = { text: optForLine.name, show: false };
      }
      optForLine.properties = options?.properties || {
        lineColor: undefined,
        numericId: undefined,
      };

      let lineEntity: Cesium.Entity | undefined = undefined;
      // "Сигналы" для колбэков ниже
      let polylinePositions: Array<Cesium.Cartesian3> = [];
      let labelPosition: Cesium.Cartesian3 = Cesium.Cartesian3.ZERO;
      // Должны быть в видимости создания lineEntity (привязаны ссылочным способом)
      const reactiveLabelPosition: Cesium.CallbackPositionProperty =
        new Cesium.CallbackPositionProperty(() => labelPosition, false);
      const reactivePolylinePositions: Cesium.CallbackProperty = new Cesium.CallbackProperty(
        () => polylinePositions,
        false,
      );
      let pointCounter: number = 0;

      this.$toolsService.createNewCommonHandler(this.toolName);
      const setPoint = async (movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        try {
          this._drawingHasStarted.set(true);
          this.$viewerService.onEntityPickingBlock();
          let mouseEntity: Cesium.Entity | undefined = undefined;
          let nowPos: Cesium.Cartesian3 | undefined = undefined;
          if (this.$toolsService.isMobile && movement?.position instanceof Cesium.Cartesian2) {
            const touchPosition: Cesium.Cartesian2 = movement.position;
            if (touchPosition.x && touchPosition.y) {
              nowPos = this.$viewerService?.viewer?.scene?.pickPosition(touchPosition);
              if (nowPos && nowPos instanceof Cesium.Cartesian3) {
                nowPos = await this.$toolsService.getDetailedPosition(nowPos);
              }
            }
          } else {
            mouseEntity = await this.$toolsService.getMouseEntity(true);
            nowPos = mouseEntity?.position?.getValue();
          }
          if (nowPos === undefined) {
            // throw new Error('Position arg is undefined in drawLineDrawingGraphics()');
            this.cancelThisTool();
            return;
          }

          if (polylinePositions.length === 0) {
            polylinePositions.push(nowPos);
            // Последующие точки
          } else {
            if (Cesium.Cartesian3.equals(nowPos, polylinePositions[polylinePositions.length - 1])) {
              console.log(chalk.blue('Next & start positions are equal'));
              return;
            }
            if (!this.$toolsService.isMobile) {
              polylinePositions.pop(); // удаление позиции из mousemove-события
            }
            polylinePositions.push(nowPos); // добавление позиции из клика
          }

          if (optForPoint?.id) {
            const newIdArr: string[] = optForPoint.id.split('-');
            // Точки будут отличаться окончанием id
            newIdArr[newIdArr.length - 1] = `${Math.ceil(Math.random() * 1000000)}`;
            optForPoint.id = newIdArr.join('-');
          }
          pointCounter++;
          optForPoint.label = {
            ...{
              text: `${pointCounter}`,
              font: options?.font || '12px monospace',
              horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(-20, -40),
            },
            ...options?.label,
          };
          optForPoint.point = {
            ...{
              show: true,
              outline: true,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 1,
            },
            ...options?.point,
          };
          const pointEntity: Cesium.Entity | undefined = this.$toolsService.setPointEntity(
            nowPos,
            optForPoint,
          );
          if (pointEntity === undefined) return;
          if (
            this.$drawingService
              .temporalEntitiesList()
              .findIndex((item) => item?.id === pointEntity?.id) !== -1
          ) {
            throw new Error('Entity already exist in temporal store by setPointEntity()');
          }
          this.$drawingService.addNewEntityToDrawLayer(pointEntity);
          this.$drawingService.temporalEntitiesList.update((arr) => [...arr, pointEntity]);

          labelPosition = polylinePositions[polylinePositions.length - 1];
          if (lineEntity === undefined) {
            lineEntity = this.$toolsService.setLineEntity(
              polylinePositions,
              labelPosition,
              this.$toolsService.isMobile ? labelTextGag : labelText,
              optForLine,
            );
            if (lineEntity) {
              if (
                this.$drawingService
                  .temporalEntitiesList()
                  .findIndex((item) => item?.id === lineEntity?.id) !== -1
              ) {
                throw new Error('Entity already exist in temporal store by setLineEntity()');
              }
              if (lineEntity.position) lineEntity.position = reactiveLabelPosition;
              if (lineEntity.polyline?.positions)
                lineEntity.polyline.positions = reactivePolylinePositions;

              this.$drawingService.addNewEntityToDrawLayer(lineEntity);
              this.$drawingService.temporalEntitiesList.update((arr) => [...arr, lineEntity]);
            }
          }
          if (this.$toolsService.isMobile && lineEntity && polylinePositions.length > 1) {
            if (lineEntity?.label) {
              if (lineEntity.label.text?.getValue() !== labelTextGag) {
                lineEntity.label.text = new Cesium.ConstantProperty(labelTextGag);
              }
              if (lineEntity.label.show?.getValue() === false) {
                lineEntity.label.show = new Cesium.ConstantProperty(true);
              }
            }
          }
          if (!this.$toolsService.isMobile) {
            // Notice: добавлять в самом конце колбэка
            polylinePositions.push(nowPos.clone()); // дубликат для стирания в первом mousemove-событии
          }
        } catch (error: unknown) {
          this.cancelThisTool();
          console.log(chalk.red(error));
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };

      this.$toolsService.setCommonHandler(setPoint, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // Передвижение курсора
      const continueDrawing = async () => {
        try {
          if (polylinePositions.length < 2) return;
          if (!this.$toolsService.isMobile) {
            const mouseEntity: Cesium.Entity = await this.$toolsService.getMouseEntity(true);
            const movePos: Cesium.Cartesian3 | undefined = mouseEntity?.position?.getValue();
            if (movePos === undefined) return;
            polylinePositions.pop(); // стирание предыдущей позиции из mousemove ИЛИ "заглушки" из предшествующих кликов
            polylinePositions.push(movePos); // добавление актуальной позиции по mousemove; даст эффект рисования карандашом, если не стирать предыдущую позицию
            labelPosition = movePos;
          }
        } catch (error: unknown) {
          this.cancelThisTool();
          console.log(chalk.red(error));
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };

      if (!this.$toolsService.isMobile) {
        this.$toolsService.setCommonHandler(
          continueDrawing,
          Cesium.ScreenSpaceEventType.MOUSE_MOVE,
        );
      }

      // ПКМ (нанесение последней точки, сокрытие описания полилинии, сценарий закрытия инструмента)
      const finishDrawing = async (_movement?: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        try {
          if (this._drawingHasStarted() === false || !lineEntity) {
            this.cancelThisTool();
            return;
          }
          if (polylinePositions.length >= 2) {
            if (
              Cesium.Cartesian3.equals(
                polylinePositions[0],
                polylinePositions[polylinePositions.length - 1],
              )
            ) {
              console.log(chalk.blue('End & start positions are equal'));
              this.cancelThisTool();
              return;
            }
            this.$viewerService.offEntityPickingBlock();
            this.$toolsService.clearCommonHandler();

            // if (!this.$toolsService.isMobile) {
            //   const mouseEntity: Cesium.Entity = await this.$toolsService.getMouseEntity();
            //   const endPos: Cesium.Cartesian3 | undefined = mouseEntity?.position?.getValue();
            //   if (endPos === undefined) {
            //     // throw new Error('Position arg is undefined in drawLineMeasureGraphics()');
            //     this.cancelThisTool();
            //     return;
            //   }
            //   if (Cesium.Cartesian3.equals(polylinePositions[0], endPos)) {
            //     console.log(chalk.blue('End & start positions are equal'));
            //     this.cancelThisTool();
            //     return;
            //   }
            //   polylinePositions.pop(); // удаление позиции из mousemove-события
            //   polylinePositions.push(endPos); // добавление позиции из клика
            //   if (optForPoint.label) {
            //     pointCounter++;
            //     optForPoint.label.text = `${pointCounter}`;
            //   }
            //   if (optForPoint?.id) {
            //     const newIdArr: string[] = optForPoint.id.split('-');
            //     newIdArr[newIdArr.length - 1] = `${Math.ceil(Math.random() * 1000000)}`;
            //     optForPoint.id = newIdArr.join('-');
            //   }
            //   const lastPointEntity: Cesium.Entity | undefined = this.$toolsService.setPointEntity(
            //     polylinePositions[polylinePositions.length - 1], // д/б endPos
            //     optForPoint,
            //   );
            //   if (lastPointEntity === undefined) return;
            //   if (
            //     this.$drawingService
            //       .temporalEntitiesList()
            //       .findIndex((item) => item?.id === lastPointEntity?.id) !== -1
            //   ) {
            //     throw new Error('Entity already exist in temporal store by setPointEntity()');
            //   }

            //   this.$drawingService.addNewEntityToDrawLayer(lastPointEntity);
            //   this.$drawingService.temporalEntitiesList.update((arr) => [...arr, lastPointEntity]);
            // }

            if (!this.$toolsService.isMobile) {
              if (optForPoint.label) {
                pointCounter++;
                optForPoint.label.text = `${pointCounter}`;
              }
              if (optForPoint?.id) {
                const newIdArr: string[] = optForPoint.id.split('-');
                newIdArr[newIdArr.length - 1] = `${Math.ceil(Math.random() * 1000000)}`;
                optForPoint.id = newIdArr.join('-');
              }
              const lastPointEntity: Cesium.Entity | undefined = this.$toolsService.setPointEntity(
                polylinePositions[polylinePositions.length - 1], // д/б movePos
                optForPoint,
              );
              if (lastPointEntity === undefined) return;
              if (
                this.$drawingService
                  .temporalEntitiesList()
                  .findIndex((item) => item?.id === lastPointEntity?.id) !== -1
              ) {
                throw new Error('Entity already exist in temporal store by setPointEntity()');
              }
              this.$drawingService.addNewEntityToDrawLayer(lastPointEntity);
              this.$drawingService.temporalEntitiesList.update((arr) => [...arr, lastPointEntity]);
            }

            // Контрольная проверка
            let pointsQuantity: number = 0;
            for (const entity of this.$drawingService.temporalEntitiesList()) {
              if (entity?.id.includes('point')) {
                pointsQuantity++;
              }
            }
            if (pointsQuantity !== polylinePositions.length) {
              console.log(
                chalk.red(
                  'WARNING:',
                  `pointsQuantity (${pointsQuantity}) !== polylinePositions.length (${polylinePositions.length})`,
                ),
              );
            }

            if (lineEntity && polylinePositions.length > 1) {
              if (lineEntity?.label) {
                if (lineEntity.label.text?.getValue() !== labelText) {
                  lineEntity.label.text = new Cesium.ConstantProperty(labelText);
                }
                if (lineEntity.label.show?.getValue() === false) {
                  lineEntity.label.show = new Cesium.ConstantProperty(true);
                }
              }
            }
            if (
              lineEntity &&
              optForLine.properties &&
              lineEntity.properties?.getValue().lineColor
            ) {
              lineEntity.properties['lineColor'] = {
                lineColor: undefined,
              };
            }
            this.$drawingService.pushGroupFromTemporal(groupIdChank, options?.toolName, lineEntity);
            this.$drawingService.clearTemporalEntitiesList(groupIdChank);
            this.$viewerService.setNewPickedEntity(lineEntity);
          }

          this.$toolsService.setDrawingsBlocker(false);
          if (options?.callback && typeof options.callback === 'function') {
            options.callback();
          }
          if (this._drawingHasStarted() === true) this._drawingHasStarted.set(false);
          this.$drawingService.setEntityConstants(lineEntity.id);
          if (options.reuse === true) {
            this.drawLineDrawingGraphics(options);
          } else this.cancelThisTool();
        } catch (error: unknown) {
          this.cancelThisTool();
          console.log(chalk.red(error));
          if (error instanceof Error) console.log(error.stack);
          alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
        }
      };
      // Notice: на тачпаде отработает на событие длинного нажатия (по умолчанию - вызов контекстного меню (не 'touch', а 'contextmenu'))
      this.$toolsService.setCommonHandler(finishDrawing, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

      return true;
    } catch (error: unknown) {
      this.cancelThisTool();
      console.log(chalk.red(error));
      if (error instanceof Error) console.log(error.stack);
      alert('Отмена сценария по причине расчетной ошибки в работе инструмента');
      return false;
    }
  }
  // --------------------- Блок работы с Cesium-сущностями инструмента (end) ------------------------ //
}
