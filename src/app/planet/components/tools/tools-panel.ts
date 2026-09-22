import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
  TemplateRef,
  QueryList,
  ViewRef,
  ElementRef,
  EmbeddedViewRef,
  AfterViewInit,
  OnInit,
  OnDestroy,
  signal,
  WritableSignal,
} from '@angular/core';
import { first, repeat, Subscription } from 'rxjs';
import chalk from 'chalk';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import {
  setNormalButtonsVisibility,
  showAuxillarySubgroup,
  hideAuxillarySubgroup,
} from '@/components/tools/lib/buttons-subgroups-visibility';

// Инструменты рисования
import { DrawingService } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { DrawMark } from '@/components/tools/drawing-tools/components/draw-mark/draw-mark';
import { DrawLine } from '@/components/tools/drawing-tools/components/draw-line/draw-line';
import { DrawRectangle } from '@/components/tools/drawing-tools/components/draw-rectangle/draw-rectangle';
import { DrawCircle } from '@/components/tools/drawing-tools/components/draw-circle/draw-circle';
import { DrawPolygon } from '@/components/tools/drawing-tools/components/draw-polygon/draw-polygon';
import { EntityRubber } from '@/components/tools/drawing-tools/components/entity-rubber/entity-rubber';
// Инструменты измерения
import { MeasureService } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import { CalculateLine } from '@/components/tools/measuring-tools/components/calculate-line/calculate-line';
import { CalculateRectangle } from '@/components/tools/measuring-tools/components/calculate-rectangle/calculate-rectangle';
import { CalculateCircle } from '@/components/tools/measuring-tools/components/calculate-circle/calculate-circle';
import { CalculatePolygon } from '@/components/tools/measuring-tools/components/calculate-polygon/calculate-polygon';
// Инструменты работы с камерой
import { CameraViewToolsService } from '@/components/tools/camera-view-tools/services/camera-view-tools-service/camera-view-tools.service';
import { FlyAround } from '@/components/tools/camera-view-tools/components/fly-around/fly-around';
import { TakeScreenshot } from '@/components/tools/camera-view-tools/components/take-screenshot/take-screenshot';
import { SceneModeChanger } from '@/components/tools/camera-view-tools/components/scene-mode-changer/scene-mode-changer';
import { ToggleFullscreen } from '@/components/tools/camera-view-tools/components/toggle-fullscreen/toggle-fullscreen';

@Component({
  selector: 'tools-panel',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    // Инструменты рисования
    DrawMark,
    DrawLine,
    DrawRectangle,
    DrawCircle,
    DrawPolygon,
    EntityRubber,
    // Инструменты измерения
    CalculateLine,
    CalculateRectangle,
    CalculateCircle,
    CalculatePolygon,
    // Инструменты работы с камерой
    FlyAround,
    TakeScreenshot,
    SceneModeChanger,
    ToggleFullscreen,
  ],
  template: `
    <div id="toolsPanelContainer" class="tools-panel-container">
      <!-- Группа "DrawingTools" -->
      <div class="tools-panel-group">
        <div #defaultDivForDrawingTools class="tools-panel-group-default">
          <ng-container #defaultNGCForDrawingTools></ng-container>
        </div>
        @if (!$toolsService.drawingsBlocker()) {
          <button
            [class.tool-panel-button-svg-mirrored]="hiddenDivHasShownForDrawingTools() === true"
            class="tool-chevron-button drawind-tools-chevron-button"
            matButton="tonal"
            (click)="
              toggleHiddenVisibility(
                hiddenDivERForDrawingTools,
                hiddenDivHasShownForDrawingTools,
                $event
              )
            "
          >
            <mat-icon>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M15.41 16.58L10.83 12l4.58-4.59L14 6l-6 6l6 6z" />
              </svg>
            </mat-icon>
          </button>
        }
        <div
          class="tools-panel-group-hidden"
          [class]="
            hiddenDivHasShownForDrawingTools() === true ? 'tools-panel-group-hidden-raised' : ''
          "
          #hiddenDivForDrawingTools
          (mousedown)="
            moveToolToDefault(
              $event,
              defaultNGCVCRForDrawingTools,
              hiddenNGCVCRForDrawingTools,
              defaultDivERForDrawingTools,
              hiddenDivERForDrawingTools,
              hiddenDivHasShownForDrawingTools
            )
          "
        >
          <ng-container #hiddenNGCForDrawingTools>
            <ng-template #childNGTForDrawingTools><draw-mark [attr.position]="0" /></ng-template>
            <ng-template #childNGTForDrawingTools><draw-line [attr.position]="1" /></ng-template>
            <ng-template #childNGTForDrawingTools
              ><draw-rectangle [attr.position]="2"
            /></ng-template>
            <ng-template #childNGTForDrawingTools><draw-circle [attr.position]="3" /></ng-template>
            <ng-template #childNGTForDrawingTools><draw-polygon [attr.position]="4" /></ng-template>
            <ng-template #childNGTForDrawingTools
              ><entity-rubber [attr.position]="5" class="tools-panel-group-hidden-last-element"
            /></ng-template>
          </ng-container>
        </div>
      </div>
      <!-- Группа "MeasuringTools" -->
      <div class="tools-panel-group">
        <div #defaultDivForMeasuringTools class="tools-panel-group-default">
          <ng-container #defaultNGCForMeasuringTools></ng-container>
        </div>
        @if (!$toolsService.drawingsBlocker()) {
          <button
            [class.tool-panel-button-svg-mirrored]="hiddenDivHasShownForMeasuringTools() === true"
            class="tool-chevron-button measuring-tools-chevron-button"
            matButton="tonal"
            (click)="
              toggleHiddenVisibility(
                hiddenDivERForMeasuringTools,
                hiddenDivHasShownForMeasuringTools,
                $event
              )
            "
          >
            <mat-icon>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M15.41 16.58L10.83 12l4.58-4.59L14 6l-6 6l6 6z" />
              </svg>
            </mat-icon>
          </button>
        }
        <div
          class="tools-panel-group-hidden"
          [class]="
            hiddenDivHasShownForMeasuringTools() === true ? 'tools-panel-group-hidden-raised' : ''
          "
          #hiddenDivForMeasuringTools
          (mousedown)="
            moveToolToDefault(
              $event,
              defaultNGCVCRForMeasuringTools,
              hiddenNGCVCRForMeasuringTools,
              defaultDivERForMeasuringTools,
              hiddenDivERForMeasuringTools,
              hiddenDivHasShownForMeasuringTools
            )
          "
        >
          <ng-container #hiddenNGCForMeasuringTools>
            <ng-template #childNGTForMeasuringTools
              ><calculate-line [attr.position]="0"
            /></ng-template>
            <ng-template #childNGTForMeasuringTools
              ><calculate-rectangle [attr.position]="1"
            /></ng-template>
            <ng-template #childNGTForMeasuringTools
              ><calculate-circle [attr.position]="2"
            /></ng-template>
            <ng-template #childNGTForMeasuringTools
              ><calculate-polygon [attr.position]="3"
            /></ng-template>
          </ng-container>
        </div>
      </div>
      <!-- Группа "CameraViewTools" -->
      <div class="tools-panel-group">
        <div #defaultDivForCameraViewTools class="tools-panel-group-default">
          <ng-container #defaultNGCForCameraViewTools></ng-container>
        </div>
        @if (!$toolsService.drawingsBlocker() && !$viewerService.cameraIsFlyingAround()) {
          <button
            [class.tool-panel-button-svg-mirrored]="hiddenDivHasShownForCameraViewTools() === true"
            class="tool-chevron-button camera-view-tools-chevron-button"
            matButton="tonal"
            (click)="
              toggleHiddenVisibility(
                hiddenDivERForCameraViewTools,
                hiddenDivHasShownForCameraViewTools,
                $event
              )
            "
          >
            <mat-icon>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M15.41 16.58L10.83 12l4.58-4.59L14 6l-6 6l6 6z" />
              </svg>
            </mat-icon>
          </button>
        }
        <div
          class="tools-panel-group-hidden"
          [class]="
            hiddenDivHasShownForCameraViewTools() === true ? 'tools-panel-group-hidden-raised' : ''
          "
          #hiddenDivForCameraViewTools
          (mousedown)="
            moveToolToDefault(
              $event,
              defaultNGCVCRForCameraViewTools,
              hiddenNGCVCRForCameraViewTools,
              defaultDivERForCameraViewTools,
              hiddenDivERForCameraViewTools,
              hiddenDivHasShownForCameraViewTools
            )
          "
        >
          <ng-container #hiddenNGCForCameraViewTools>
            <ng-template #childNGTForCameraViewTools><fly-around [attr.position]="0" /></ng-template>
            <ng-template #childNGTForCameraViewTools
              ><take-screenshot [attr.position]="1"
            /></ng-template>
            <ng-template #childNGTForCameraViewTools
              ><scene-mode-changer [attr.position]="2"
            /></ng-template>
            <ng-template #childNGTForCameraViewTools
              ><toggle-fullscreen [attr.position]="3"
            /></ng-template>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styleUrl: './tools-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolsPanel implements AfterViewInit, OnInit, OnDestroy {
  constructor(
    protected $viewerService: ViewerService,
    protected $toolsService: ToolsService,
    protected $drawingService: DrawingService,
    protected $measureService: MeasureService,
    protected $cameraViewToolsService: CameraViewToolsService,
  ) {}

  // ---------------------------------------------------------------------------------------------------------------- //
  // Формирование состава групп инструментов (групп представлений), логика перемещения шаблона компонента выбранного инструмента (представления) между подгруппами
  // ---------------------------------------------------------------------------------------------------------------- //

  // -------------------------------------------------------------------------- //
  // Группа инструментов "DrawingTools"
  @ViewChildren('childNGTForDrawingTools') childrenQLTRForDrawingTools: QueryList<
    TemplateRef<unknown>
  >; // список ссылок на <ng-template> монтируемых с привязкой по EmbeddedViewRef шаблонов инструментов группы
  @ViewChild('defaultNGCForDrawingTools', { read: ViewContainerRef }) // ссылка на <ng-conteiner> в который динамически монтируются шаблоны инструментов группы
  defaultNGCVCRForDrawingTools: ViewContainerRef;
  @ViewChild('hiddenNGCForDrawingTools', { read: ViewContainerRef }) // -- // -- // -- // --
  hiddenNGCVCRForDrawingTools: ViewContainerRef;
  @ViewChild('defaultDivForDrawingTools', { read: ElementRef }) // ссылка для последующего управления кастомным атрибутом 'button-visibility' хостов дочерних компонентов (инструментов группы)
  defaultDivERForDrawingTools: ElementRef;
  @ViewChild('hiddenDivForDrawingTools', { read: ElementRef }) // -- // -- // -- // --
  hiddenDivERForDrawingTools: ElementRef;
  protected hiddenDivHasShownForDrawingTools = signal<boolean>(false); // флаг показа скрываемой подгруппы
  // -------------------------------------------------------------------------- //
  // Группа инструментов "MeasuringTools"
  @ViewChildren('childNGTForMeasuringTools') childrenQLTRForMeasuringTools: QueryList<
    TemplateRef<unknown>
  >;
  @ViewChild('defaultNGCForMeasuringTools', { read: ViewContainerRef })
  defaultNGCVCRForMeasuringTools: ViewContainerRef;
  @ViewChild('hiddenNGCForMeasuringTools', { read: ViewContainerRef })
  hiddenNGCVCRForMeasuringTools: ViewContainerRef;
  @ViewChild('defaultDivForMeasuringTools', { read: ElementRef })
  defaultDivERForMeasuringTools: ElementRef;
  @ViewChild('hiddenDivForMeasuringTools', { read: ElementRef })
  hiddenDivERForMeasuringTools: ElementRef;
  protected hiddenDivHasShownForMeasuringTools = signal<boolean>(false);
  // -------------------------------------------------------------------------- //
  // Группа инструментов "CameraViewTools"
  @ViewChildren('childNGTForCameraViewTools') childrenQLTRForCameraViewTools: QueryList<
    TemplateRef<unknown>
  >;
  @ViewChild('defaultNGCForCameraViewTools', { read: ViewContainerRef })
  defaultNGCVCRForCameraViewTools: ViewContainerRef;
  @ViewChild('hiddenNGCForCameraViewTools', { read: ViewContainerRef })
  hiddenNGCVCRForCameraViewTools: ViewContainerRef;
  @ViewChild('defaultDivForCameraViewTools', { read: ElementRef })
  defaultDivERForCameraViewTools: ElementRef;
  @ViewChild('hiddenDivForCameraViewTools', { read: ElementRef })
  hiddenDivERForCameraViewTools: ElementRef;
  protected hiddenDivHasShownForCameraViewTools = signal<boolean>(false);
  // -------------------------------------------------------------------------- //
  // ...другие группы

  // Отрисовка групп инструментов после получения необходимых для динамического монтирования ссылок
  ngAfterViewInit() {
    // Для группы "DrawingTools"
    this.renderToolsGroupTemplates(
      this.childrenQLTRForDrawingTools,
      this.defaultNGCVCRForDrawingTools,
      this.hiddenNGCVCRForDrawingTools,
      this.defaultDivERForDrawingTools,
      this.hiddenDivERForDrawingTools,
      this.hiddenDivHasShownForDrawingTools,
    );
    // Для группы "MeasuringTools"
    this.renderToolsGroupTemplates(
      this.childrenQLTRForMeasuringTools,
      this.defaultNGCVCRForMeasuringTools,
      this.hiddenNGCVCRForMeasuringTools,
      this.defaultDivERForMeasuringTools,
      this.hiddenDivERForMeasuringTools,
      this.hiddenDivHasShownForMeasuringTools,
    );

    // Для группы "CameraViewTools"
    this.renderToolsGroupTemplates(
      this.childrenQLTRForCameraViewTools,
      this.defaultNGCVCRForCameraViewTools,
      this.hiddenNGCVCRForCameraViewTools,
      this.defaultDivERForCameraViewTools,
      this.hiddenDivERForCameraViewTools,
      this.hiddenDivHasShownForCameraViewTools,
    );

    // ...другие группы
  }

  // Метод для ngAfterViewInit
  private renderToolsGroupTemplates(
    childrenQLTR: QueryList<TemplateRef<unknown>>,
    defaultNGCVCR: ViewContainerRef,
    hiddenNGCVCR: ViewContainerRef,
    defaultDivER: ElementRef,
    hiddenDivER: ElementRef,
    hiddenDivHasShown: WritableSignal<boolean>,
  ): boolean {
    try {
      const firstTR = childrenQLTR.first;
      for (const child of childrenQLTR) {
        // Изначально шаблон компонента в <ng-template> не отрисовывается.
        // Выражение отрисует шаблон дочернего компонента в указанном по ссылке месте и далее позволит динамически перемещать такой шаблон без перемонтирования его компонента (без потери состояний)
        const embeddedView: EmbeddedViewRef<unknown> = hiddenNGCVCR.createEmbeddedView(child);
        // Перенос первого в очереди компонента в контейнер дефолтного инструмента группы
        if (embeddedView) {
          if (child === firstTR) {
            const detachedView: ViewRef | null = hiddenNGCVCR.detach(0); // отвязка
            if (detachedView) {
              defaultNGCVCR.insert(detachedView); // привязка
            } else
              throw new Error(
                'View detach has failed in moveToolTrenderToolsGroupTemplatesoDefault fn',
              );
          }
        }
      }
      // Установка начальных значений кастомного атрибута хостов компонентов, входящих в гуппы, служащего для управления видимостью их кнопок
      if (setNormalButtonsVisibility(defaultDivER, hiddenDivER) === true) {
        hiddenDivHasShown.set(false);
        // console.log(hiddenDivHasShown());
        return true;
      } else {
        console.log('setNormalButtonsVisibility fn has failed');
        return false;
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  // Метод для клика по кнопке внутри вспомогательного контейнера группы
  protected moveToolToDefault(
    event: MouseEvent,
    defaultNGCVCR: ViewContainerRef,
    hiddenNGCVCR: ViewContainerRef,
    defaultDivER: ElementRef,
    hiddenDivER: ElementRef,
    hiddenDivHasShown: WritableSignal<boolean>,
  ): boolean {
    try {
      event.stopPropagation();
      if (event.button !== 0) {
        return false;
      }

      // ----------------------------------------------------------- //
      // Определение кнопки для перемещения по пути всплытия события
      // ----------------------------------------------------------- //

      const bubbleBranch = Array.from(event.composedPath());
      const whereCatched = event.currentTarget;
      const whereCatchedIndex = bubbleBranch.findIndex((el) => el === whereCatched);
      let btnElHost = undefined;
      // Нормальный сценарий - при активации события ниже уровня hiddenDiv (от кнопки)
      if (whereCatchedIndex > 0) {
        if (!(bubbleBranch[whereCatchedIndex - 1] instanceof HTMLElement)) {
          throw new Error('Searched "btnElHost" is not an HTMLElement');
        } else {
          btnElHost = bubbleBranch[whereCatchedIndex - 1];
        }
        // При отсутствии кнопки во всплытии события (возможно при перехвате события ниже по DOM-ветке)
      } else if (whereCatchedIndex === 0) {
        this.offHiddenVisibility(hiddenDivER, hiddenDivHasShown);
        throw new Error("Event's bubbling hasn't contained button element");
      }

      // ------------------------------ //
      // Перемещение между контейнерами
      // ------------------------------ //

      // Проверка на наличие кастомного атрибута 'position' хоста кнопки в дефолтном контейнере
      const defaultBtnEl = defaultDivER.nativeElement.firstChild;
      const defaultBtnElPositionAttr: string | null | undefined = (
        defaultBtnEl as HTMLElement
      )?.getAttribute('position');
      const defaultBtnElPosition = Number(defaultBtnElPositionAttr);

      // Перенос заменяемой кнопки из дефолтного обратно в скрываемый контейнер
      // Сценарий с сохранением порядка очередности инструментов (используется кастомный атрибут 'position')
      if (defaultBtnElPositionAttr !== null && isFinite(defaultBtnElPosition)) {
        if (defaultBtnElPosition < 0) {
          throw new Error(
            `defaultBtnElPosition is invalid in moveToolToDefault fn: ${defaultBtnElPosition}`,
          );
        }
        // Крайнее левое значение attr.position (ноль)
        if (defaultBtnElPosition === 0) {
          const detachedViewPrev = defaultNGCVCR.detach(0);
          if (detachedViewPrev) {
            hiddenNGCVCR.insert(detachedViewPrev, 0);
          } else throw new Error('View detach has failed in moveToolToDefault fn');
        } else {
          // Крайнее правое значение attr.position (максимальное в группе)
          if (defaultBtnElPosition === hiddenDivER.nativeElement.children.length) {
            const detachedViewPrev = defaultNGCVCR.detach(0);
            if (detachedViewPrev) {
              hiddenNGCVCR.insert(detachedViewPrev);
            } else throw new Error('View detach has failed in moveToolToDefault fn');
          } else {
            // Промежуточные значения
            const hidArr = Array.from(hiddenDivER.nativeElement.children);
            let indexInVCRToPaste: number | undefined = undefined;
            for (let i = 0; i <= hidArr.length - 1; i++) {
              if (hidArr[i] && hidArr[i] instanceof HTMLElement) {
                const thisElPosAttr = (hidArr[i] as HTMLElement).getAttribute('position');
                const thisElPos = Number(thisElPosAttr);
                if (thisElPosAttr === null || !isFinite(defaultBtnElPosition)) {
                  console.log(
                    chalk.blue(
                      'Position attribute is not valid in hiddenDiv\'s "for"-cicle: ',
                      thisElPosAttr,
                    ),
                  );
                  indexInVCRToPaste = undefined;
                  break;
                }
                // Notice: теряет актуальность при обратном порядке перемещения кнопок между контейнерами
                if (thisElPos === defaultBtnElPosition + 1) {
                  indexInVCRToPaste = i;
                  break;
                }
              }
            }
            if (indexInVCRToPaste !== undefined) {
              const detachedViewPrev = defaultNGCVCR.detach(0);
              if (detachedViewPrev) {
                hiddenNGCVCR.insert(detachedViewPrev, indexInVCRToPaste);
              } else throw new Error('View detach has failed in moveToolToDefault fn');
              // Резервный вариант
            } else {
              const detachedViewPrev = defaultNGCVCR.detach(0);
              if (detachedViewPrev) {
                hiddenNGCVCR.insert(detachedViewPrev);
                console.log(chalk.blue('indexInVCRToPaste is not defined'));
                console.log('Searched in ', hidArr);
                console.log(chalk.blue("Insert without using tool's positions"));
              } else throw new Error('View detach has failed in moveToolToDefault fn');
            }
          }
        }
        // Сценарий без учета порядка очередности кнопок
      } else {
        const detachedViewPrev = defaultNGCVCR.detach(0);
        if (detachedViewPrev) {
          hiddenNGCVCR.insert(detachedViewPrev);
          console.log(chalk.blue(`defaultBtnElPositionAttr === ${defaultBtnElPositionAttr}`));
          console.log(chalk.blue("Insert without using tool's positions"));
        } else throw new Error('View detach has failed in moveToolToDefault fn');
      }

      // Перенос новой выбранной кнопки в дефолтный контейнер
      let indexInVCRToCut: number | undefined = undefined;
      const hiddenChildren = Array.from(hiddenDivER.nativeElement.children);
      for (let i = 0; i <= hiddenChildren.length - 1; i++) {
        if (indexInVCRToCut === undefined && hiddenChildren[i] === btnElHost) {
          indexInVCRToCut = i;
          break;
        }
      }
      if (indexInVCRToCut === undefined || indexInVCRToCut === -1) {
        console.log(hiddenChildren);
        console.log(btnElHost);
        throw new Error(
          "Tool's host element index wasn't found in hiddenDivER in moveToolToDefault fn",
        );
      }
      const detachedViewNext = hiddenNGCVCR.detach(indexInVCRToCut);
      if (detachedViewNext) {
        defaultNGCVCR.insert(detachedViewNext);
      } else throw new Error('View detach has failed in moveToolToDefault fn');

      // --------------------------- //
      // Установка видимости кнопок
      // --------------------------- //
      if (setNormalButtonsVisibility(defaultDivER, hiddenDivER) === true) {
        hiddenDivHasShown.set(false);
        // console.log(hiddenDivHasShown());
        return true;
      } else {
        throw new Error('setNormalButtonsVisibility fn has failed in moveToolToDefault fn');
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  // ---------------------------------------------------------------------------------------------------------------- //
  // Методы управления видимостью кнопок инструментов, входящих в группы
  // ---------------------------------------------------------------------------------------------------------------- //

  @HostListener('document:click', ['$event'])
  // Метод для клика вне границ контейнеров для вспомогательных подгрупп
  handleForOutOfHiddenGroupBoundariesClick(event: MouseEvent): void {
    // Для группы "DrawingTools"
    if (this.hiddenDivHasShownForDrawingTools() === true) {
      if (this.hiddenDivERForDrawingTools?.nativeElement) {
        if (
          this.hiddenDivERForDrawingTools.nativeElement.contains(event.target) === false &&
          event.target instanceof Element &&
          !event.target?.closest?.('.drawind-tools-chevron-button')
        ) {
          if (hideAuxillarySubgroup(this.hiddenDivERForDrawingTools) === true) {
            this.hiddenDivHasShownForDrawingTools.set(false);
          } else
            console.log(
              `Hiding ${this.hiddenDivERForDrawingTools.nativeElement.tagName} button by Esc has failed in outOfBoundaries handler`,
            );
        }
      } else
        console.log('"hiddenDivER" was not defined for DrawingTools in out-of-boundaries handler');
    }
    // Для группы "MeasuringTools"
    if (this.hiddenDivHasShownForMeasuringTools() === true) {
      if (this.hiddenDivERForMeasuringTools?.nativeElement) {
        if (
          this.hiddenDivERForMeasuringTools.nativeElement.contains(event.target) === false &&
          event.target instanceof Element &&
          !event.target?.closest?.('.measuring-tools-chevron-button')
        ) {
          if (hideAuxillarySubgroup(this.hiddenDivERForMeasuringTools) === true) {
            this.hiddenDivHasShownForMeasuringTools.set(false);
          } else
            console.log(
              `Hiding ${this.hiddenDivERForMeasuringTools.nativeElement.tagName} button by Esc has failed in outOfBoundaries handler`,
            );
        }
      } else
        console.log(
          '"hiddenDivER" was not defined for MeasuringTools in out-of-boundaries handler',
        );
    }
    // Для группы "CameraViewTools"
    if (this.hiddenDivHasShownForCameraViewTools() === true) {
      if (this.hiddenDivERForCameraViewTools?.nativeElement) {
        if (
          this.hiddenDivERForCameraViewTools.nativeElement.contains(event.target) === false &&
          event.target instanceof Element &&
          !event.target?.closest?.('.camera-view-tools-chevron-button')
        ) {
          if (hideAuxillarySubgroup(this.hiddenDivERForCameraViewTools) === true) {
            this.hiddenDivHasShownForCameraViewTools.set(false);
          } else
            console.log(
              `Hiding ${this.hiddenDivERForCameraViewTools.nativeElement.tagName} button by Esc has failed in outOfBoundaries handler`,
            );
        }
      } else
        console.log('"hiddenDivER" was not defined for CameraViewTools in out-of-boundaries handler');
    }
    // ...другие группы
  }

  // Метод для клика по кнопке, переключающей видимость вспомогательной подгруппы кнопок
  protected toggleHiddenVisibility(
    hiddenDivER: ElementRef,
    hiddenDivHasShown: WritableSignal<boolean>,
    _event?: MouseEvent,
  ): boolean {
    try {
      // _event.stopPropagation(); // не перехватывать, нужно для this.handleForOutOfHiddenGroupBoundariesClick()
      if (hiddenDivHasShown() === false) {
        if (showAuxillarySubgroup(hiddenDivER)) {
          hiddenDivHasShown.set(true);
          // console.log(hiddenDivHasShown());
          return true;
        } else {
          console.log('showAuxillarySubgroup fn has failed');
          return false;
        }
      } else if (hiddenDivHasShown() === true) {
        if (hideAuxillarySubgroup(hiddenDivER)) {
          hiddenDivHasShown.set(false);
          // console.log(hiddenDivHasShown());
          return true;
        } else {
          console.log('hideAuxillarySubgroup fn has failed');
          return false;
        }
      } else
        throw new Error('"hiddenDivHasShown" signal is not defined in toggleHiddenVisibility fn');
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  // Метод для прослушивателя нажатия Esc
  protected offHiddenVisibility(
    hiddenDivER: ElementRef,
    hiddenDivHasShown: WritableSignal<boolean>,
  ): boolean {
    try {
      // event.stopPropagation(); // уже остановлено в общем хэндлере
      if (hideAuxillarySubgroup(hiddenDivER)) {
        hiddenDivHasShown.set(false);
        // console.log(hiddenDivHasShown());
        return true;
      } else return false;
    } catch (error: unknown) {
      console.log(chalk.red(error));
      return false;
    }
  }

  // ---------------------------------------------------------------------------------------------------------------- //
  // Отработка 'keyup.escape'-события при использовании настоящих инструментов
  // ---------------------------------------------------------------------------------------------------------------- //

  // Получение ссылок на компоненты инструментов с целью использования их методов
  // Инструменты рисования
  @ViewChild(DrawMark) drawMarkRef: DrawMark;
  @ViewChild(DrawLine) drawLineRef: DrawLine;
  @ViewChild(DrawRectangle) drawRectangleRef: DrawRectangle;
  @ViewChild(DrawCircle) drawCircleRef: DrawCircle;
  @ViewChild(DrawPolygon) drawPolygonRef: DrawPolygon;
  @ViewChild(EntityRubber) entityRubberRef: EntityRubber;
  // Инструменты измерения
  @ViewChild(CalculateLine) calculateLineRef: CalculateLine;
  @ViewChild(CalculateRectangle) calculateRectangleRef: CalculateRectangle;
  @ViewChild(CalculateCircle) calculateCircleRef: CalculateCircle;
  @ViewChild(CalculatePolygon) calculatePolygonRef: CalculatePolygon;
  // Инструменты работы с картой
  @ViewChild(FlyAround) flyAroundRef: FlyAround;
  // ...другие инструменты

  declare private unexpectedErrorSubscription: Subscription;
  ngOnInit() {
    try {
      // Подписка на ошибки при выполнении общих сценариев инструментов, не имеющих обработчики ошибок, характерные для конкретного инструмента
      this.unexpectedErrorSubscription = this.$toolsService.cancelEvent$
        .pipe(first(), repeat())
        .subscribe((data) => {
          console.log(
            chalk.blue(`Canceled because tool's error has detected (from tool "${data}")`),
          );
          // Инструменты рисования
          if (data === this.drawMarkRef.toolName) {
            this.drawMarkRef.cancelByEsc();
            return;
          }
          if (data === this.drawLineRef.toolName) {
            this.drawLineRef.cancelByEsc();
            return;
          }
          if (data === this.drawRectangleRef.toolName) {
            this.drawRectangleRef.cancelByEsc();
            return;
          }
          if (data === this.drawCircleRef.toolName) {
            this.drawCircleRef.cancelByEsc();
            return;
          }
          if (data === this.drawPolygonRef.toolName) {
            this.drawPolygonRef.cancelByEsc();
            return;
          }
          if (data === this.entityRubberRef.toolName) {
            this.entityRubberRef.cancelByEsc();
            return;
          }

          // Инструменты измерения
          if (data === this.calculateLineRef.toolName) {
            this.calculateLineRef.cancelByEsc();
            return;
          }
          if (data === this.calculateRectangleRef.toolName) {
            this.calculateRectangleRef.cancelByEsc();
            return;
          }
          if (data === this.calculateCircleRef.toolName) {
            this.calculateCircleRef.cancelByEsc();
            return;
          }
          if (data === this.calculatePolygonRef.toolName) {
            this.calculatePolygonRef.cancelByEsc();
            return;
          }

          // Инструменты работы с камерой
          if (data === this.flyAroundRef.toolName) {
            this.flyAroundRef.cancelByEsc();
            return;
          }
        });
    } catch (error: unknown) {
      console.log(chalk.red(error));
      if (error instanceof Error) console.log(error.stack);
    }
  }

  ngOnDestroy() {
    this.unexpectedErrorSubscription?.unsubscribe();
  }

  @HostListener('document:keyup.escape', ['$event'])
  doEscHandlers(event: Event) {
    this.handleForEscHideSubgroup(event);
    this.handleForEscToolDeactivation(event);
  }

  // Сокрытие вспомогательных групп инструментов по Esc
  private handleForEscHideSubgroup(_event?: Event): void {
    try {
      // Инструменты рисования
      if (this.hiddenDivHasShownForDrawingTools() === true) {
        this.offHiddenVisibility(
          this.hiddenDivERForDrawingTools,
          this.hiddenDivHasShownForDrawingTools,
        );
      }
      // Инструменты измерения
      if (this.hiddenDivHasShownForMeasuringTools() === true) {
        this.offHiddenVisibility(
          this.hiddenDivERForMeasuringTools,
          this.hiddenDivHasShownForMeasuringTools,
        );
      }
      // Инструменты работы с камерой
      if (this.hiddenDivHasShownForCameraViewTools() === true) {
        this.offHiddenVisibility(
          this.hiddenDivERForCameraViewTools,
          this.hiddenDivHasShownForCameraViewTools,
        );
      }
      // ...другие группы
    } catch (error: unknown) {
      console.log(chalk.red(error));
    }
  }

  // Деактивация инструментов по Esc
  private handleForEscToolDeactivation(_event?: Event): void {
    try {
      // @ts-ignore (конфликт - кастомное свойство _initializer)
      if (!this.$toolsService?.commonHandler?.()?._initializer) return;
      // Инструменты рисования
      // @ts-ignore (конфликт - кастомное свойство _initializer)
      if (this.$toolsService.commonHandler()._initializer === this.drawMarkRef.toolName) {
        this.drawMarkRef.cancelByEsc();
        return;
      }
      // @ts-ignore (конфликт - кастомное свойство _initializer)
      else if (this.$toolsService.commonHandler()._initializer === this.drawLineRef.toolName) {
        this.drawLineRef.cancelByEsc();
        return;
      }
      // @ts-ignore (конфликт - кастомное свойство _initializer)
      else if (this.$toolsService.commonHandler()._initializer === this.drawRectangleRef.toolName) {
        this.drawRectangleRef.cancelByEsc();
        return;
      }
      // @ts-ignore (конфликт - кастомное свойство _initializer)
      else if (this.$toolsService.commonHandler()._initializer === this.drawCircleRef.toolName) {
        this.drawCircleRef.cancelByEsc();
        return;
      }
      // @ts-ignore (конфликт - кастомное свойство _initializer)
      else if (this.$toolsService.commonHandler()._initializer === this.drawPolygonRef.toolName) {
        this.drawPolygonRef.cancelByEsc();
        return;
        // @ts-ignore (конфликт - кастомное свойство _initializer)
      } else if (this.$toolsService.commonHandler()._initializer === this.entityRubberRef.toolName) {
        this.entityRubberRef.cancelByEsc();
        return;
      }

      // Инструменты измерения
      else if (
        // @ts-ignore (конфликт - кастомное свойство _initializer)
        this.$toolsService.commonHandler()._initializer === this.calculateLineRef.toolName
      ) {
        this.calculateLineRef.cancelByEsc();
        return;
      } else if (
        // @ts-ignore (конфликт - кастомное свойство _initializer)
        this.$toolsService.commonHandler()._initializer ===
        this.calculateRectangleRef.toolName
      ) {
        this.calculateRectangleRef.cancelByEsc();
        return;
      } else if (
        // @ts-ignore (конфликт - кастомное свойство _initializer)
        this.$toolsService.commonHandler()._initializer === this.calculateCircleRef.toolName
      ) {
        this.calculateCircleRef.cancelByEsc();
        return;
      } else if (
        // @ts-ignore (конфликт - кастомное свойство _initializer)
        this.$toolsService.commonHandler()._initializer ===
        this.calculatePolygonRef.toolName
      ) {
        this.calculatePolygonRef.cancelByEsc();
        return;
      }

      // Инструменты измерения
      else if (
        // @ts-ignore (конфликт - кастомное свойство _initializer)
        this.$toolsService.commonHandler()._initializer === this.flyAroundRef.toolName ||
        // @ts-ignore (конфликт - кастомное свойство _initializer)
        this.$toolsService.commonHandler()._initializer === this.flyAroundRef.toolNameAlt
      ) {
        this.flyAroundRef.cancelByEsc();
        return;
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
    }
  }

  protected visibleWindow(chapterId: string) {
    let element = document.getElementById(chapterId);
    if (element!.style.display === 'none') {
      element!.style.display = 'block';
    } else {
      element!.style.display = 'none';
    }
  }
}
