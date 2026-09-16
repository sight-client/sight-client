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
import { AddMark } from '@/components/tools/drawing-tools/components/add-mark/add-mark';
import { AddLine } from '@/components/tools/drawing-tools/components/add-line/add-line';
import { AddRectangle } from '@/components/tools/drawing-tools/components/add-rectangle/add-rectangle';
import { AddCircle } from '@/components/tools/drawing-tools/components/add-circle/add-circle';
import { AddPolygon } from '@/components/tools/drawing-tools/components/add-polygon/add-polygon';
import { EraseEntity } from '@/components/tools/drawing-tools/components/erase-entity/erase-entity';
// Инструменты измерения
import { MeasureService } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import { LinearMeasurements } from '@/components/tools/measuring-tools/components/linear-measurements/linear-measurements';
import { RectangleAreaMeasurements } from '@/components/tools/measuring-tools/components/rectangle-area-measurements/rectangle-area-measurements';
import { CircleAreaMeasurements } from '@/components/tools/measuring-tools/components/circle-area-measurements/circle-area-measurements';
import { PolygonalAreaMeasurements } from '@/components/tools/measuring-tools/components/polygonal-area-measurements/polygonal-area-measurements';
// Инструменты работы с камерой
import { CameraToolsService } from '@/components/tools/camera-tools/services/camera-tools-service/camera-tools.service';
import { FlyAround } from '@/components/tools/camera-tools/components/fly-around/fly-around';
import { TakeScreenshot } from '@/components/tools/camera-tools/components/take-screenshot/take-screenshot';
import { SceneModeChanger } from '@/components/tools/camera-tools/components/scene-mode-changer/scene-mode-changer';

@Component({
  selector: 'tools-panel',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    // Инструменты рисования
    AddMark,
    AddLine,
    AddRectangle,
    AddCircle,
    AddPolygon,
    EraseEntity,
    // Инструменты измерения
    LinearMeasurements,
    RectangleAreaMeasurements,
    CircleAreaMeasurements,
    PolygonalAreaMeasurements,
    // Инструменты работы с камерой
    FlyAround,
    TakeScreenshot,
    SceneModeChanger,
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
            <ng-template #childNGTForDrawingTools><add-mark [attr.position]="0" /></ng-template>
            <ng-template #childNGTForDrawingTools><add-line [attr.position]="1" /></ng-template>
            <ng-template #childNGTForDrawingTools
              ><add-rectangle [attr.position]="2"
            /></ng-template>
            <ng-template #childNGTForDrawingTools><add-circle [attr.position]="3" /></ng-template>
            <ng-template #childNGTForDrawingTools><add-polygon [attr.position]="4" /></ng-template>
            <ng-template #childNGTForDrawingTools
              ><erase-entity [attr.position]="5" class="tools-panel-group-hidden-last-element"
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
              ><linear-measurements [attr.position]="0"
            /></ng-template>
            <ng-template #childNGTForMeasuringTools
              ><rectangle-area-measurements [attr.position]="1"
            /></ng-template>
            <ng-template #childNGTForMeasuringTools
              ><circle-area-measurements [attr.position]="2"
            /></ng-template>
            <ng-template #childNGTForMeasuringTools
              ><polygonal-area-measurements [attr.position]="3"
            /></ng-template>
          </ng-container>
        </div>
      </div>
      <!-- Группа "CameraTools" -->
      <div class="tools-panel-group">
        <div #defaultDivForCameraTools class="tools-panel-group-default">
          <ng-container #defaultNGCForCameraTools></ng-container>
        </div>
        @if (!$toolsService.drawingsBlocker() && !$viewerService.cameraIsFlyingAround()) {
          <button
            [class.tool-panel-button-svg-mirrored]="hiddenDivHasShownForCameraTools() === true"
            class="tool-chevron-button camera-tools-chevron-button"
            matButton="tonal"
            (click)="
              toggleHiddenVisibility(
                hiddenDivERForCameraTools,
                hiddenDivHasShownForCameraTools,
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
            hiddenDivHasShownForCameraTools() === true ? 'tools-panel-group-hidden-raised' : ''
          "
          #hiddenDivForCameraTools
          (mousedown)="
            moveToolToDefault(
              $event,
              defaultNGCVCRForCameraTools,
              hiddenNGCVCRForCameraTools,
              defaultDivERForCameraTools,
              hiddenDivERForCameraTools,
              hiddenDivHasShownForCameraTools
            )
          "
        >
          <ng-container #hiddenNGCForCameraTools>
            <ng-template #childNGTForCameraTools><fly-around [attr.position]="0" /></ng-template>
            <ng-template #childNGTForCameraTools
              ><take-screenshot [attr.position]="1"
            /></ng-template>
            <ng-template #childNGTForCameraTools
              ><scene-mode-changer [attr.position]="2"
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
    protected $cameraToolsService: CameraToolsService,
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
  // Группа инструментов "CameraTools"
  @ViewChildren('childNGTForCameraTools') childrenQLTRForCameraTools: QueryList<
    TemplateRef<unknown>
  >;
  @ViewChild('defaultNGCForCameraTools', { read: ViewContainerRef })
  defaultNGCVCRForCameraTools: ViewContainerRef;
  @ViewChild('hiddenNGCForCameraTools', { read: ViewContainerRef })
  hiddenNGCVCRForCameraTools: ViewContainerRef;
  @ViewChild('defaultDivForCameraTools', { read: ElementRef })
  defaultDivERForCameraTools: ElementRef;
  @ViewChild('hiddenDivForCameraTools', { read: ElementRef })
  hiddenDivERForCameraTools: ElementRef;
  protected hiddenDivHasShownForCameraTools = signal<boolean>(false);
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

    // Для группы "CameraTools"
    this.renderToolsGroupTemplates(
      this.childrenQLTRForCameraTools,
      this.defaultNGCVCRForCameraTools,
      this.hiddenNGCVCRForCameraTools,
      this.defaultDivERForCameraTools,
      this.hiddenDivERForCameraTools,
      this.hiddenDivHasShownForCameraTools,
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
    // Для группы "CameraTools"
    if (this.hiddenDivHasShownForCameraTools() === true) {
      if (this.hiddenDivERForCameraTools?.nativeElement) {
        if (
          this.hiddenDivERForCameraTools.nativeElement.contains(event.target) === false &&
          event.target instanceof Element &&
          !event.target?.closest?.('.camera-tools-chevron-button')
        ) {
          if (hideAuxillarySubgroup(this.hiddenDivERForCameraTools) === true) {
            this.hiddenDivHasShownForCameraTools.set(false);
          } else
            console.log(
              `Hiding ${this.hiddenDivERForCameraTools.nativeElement.tagName} button by Esc has failed in outOfBoundaries handler`,
            );
        }
      } else
        console.log('"hiddenDivER" was not defined for CameraTools in out-of-boundaries handler');
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
  @ViewChild(AddMark) addMarkRef: AddMark;
  @ViewChild(AddLine) addLineRef: AddLine;
  @ViewChild(AddRectangle) addRectangleRef: AddRectangle;
  @ViewChild(AddCircle) addCircleRef: AddCircle;
  @ViewChild(AddPolygon) addPolygonRef: AddPolygon;
  @ViewChild(EraseEntity) eraseEntityRef: EraseEntity;
  // Инструменты измерения
  @ViewChild(LinearMeasurements) linearMeasurementsRef: LinearMeasurements;
  @ViewChild(RectangleAreaMeasurements) rectangleAreaMeasurementsRef: RectangleAreaMeasurements;
  @ViewChild(CircleAreaMeasurements) circleAreaMeasurementsRef: CircleAreaMeasurements;
  @ViewChild(PolygonalAreaMeasurements) polygonalAreaMeasurementsRef: PolygonalAreaMeasurements;
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
          if (data === this.addMarkRef.toolName) {
            this.addMarkRef.cancelByEsc();
            return;
          }
          if (data === this.addLineRef.toolName) {
            this.addLineRef.cancelByEsc();
            return;
          }
          if (data === this.addRectangleRef.toolName) {
            this.addRectangleRef.cancelByEsc();
            return;
          }
          if (data === this.addCircleRef.toolName) {
            this.addCircleRef.cancelByEsc();
            return;
          }
          if (data === this.addPolygonRef.toolName) {
            this.addPolygonRef.cancelByEsc();
            return;
          }
          if (data === this.eraseEntityRef.toolName) {
            this.eraseEntityRef.cancelByEsc();
            return;
          }

          // Инструменты измерения
          if (data === this.linearMeasurementsRef.toolName) {
            this.linearMeasurementsRef.cancelByEsc();
            return;
          }
          if (data === this.rectangleAreaMeasurementsRef.toolName) {
            this.rectangleAreaMeasurementsRef.cancelByEsc();
            return;
          }
          if (data === this.circleAreaMeasurementsRef.toolName) {
            this.circleAreaMeasurementsRef.cancelByEsc();
            return;
          }
          if (data === this.polygonalAreaMeasurementsRef.toolName) {
            this.polygonalAreaMeasurementsRef.cancelByEsc();
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
      if (this.hiddenDivHasShownForCameraTools() === true) {
        this.offHiddenVisibility(
          this.hiddenDivERForCameraTools,
          this.hiddenDivHasShownForCameraTools,
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
      if (this.$toolsService.commonHandler()._initializer === this.addMarkRef.toolName) {
        this.addMarkRef.cancelByEsc();
        return;
      }
      // @ts-ignore (конфликт - кастомное свойство _initializer)
      else if (this.$toolsService.commonHandler()._initializer === this.addLineRef.toolName) {
        this.addLineRef.cancelByEsc();
        return;
      }
      // @ts-ignore (конфликт - кастомное свойство _initializer)
      else if (this.$toolsService.commonHandler()._initializer === this.addRectangleRef.toolName) {
        this.addRectangleRef.cancelByEsc();
        return;
      }
      // @ts-ignore (конфликт - кастомное свойство _initializer)
      else if (this.$toolsService.commonHandler()._initializer === this.addCircleRef.toolName) {
        this.addCircleRef.cancelByEsc();
        return;
      }
      // @ts-ignore (конфликт - кастомное свойство _initializer)
      else if (this.$toolsService.commonHandler()._initializer === this.addPolygonRef.toolName) {
        this.addPolygonRef.cancelByEsc();
        return;
        // @ts-ignore (конфликт - кастомное свойство _initializer)
      } else if (this.$toolsService.commonHandler()._initializer === this.eraseEntityRef.toolName) {
        this.eraseEntityRef.cancelByEsc();
        return;
      }

      // Инструменты измерения
      else if (
        // @ts-ignore (конфликт - кастомное свойство _initializer)
        this.$toolsService.commonHandler()._initializer === this.linearMeasurementsRef.toolName
      ) {
        this.linearMeasurementsRef.cancelByEsc();
        return;
      } else if (
        // @ts-ignore (конфликт - кастомное свойство _initializer)
        this.$toolsService.commonHandler()._initializer ===
        this.rectangleAreaMeasurementsRef.toolName
      ) {
        this.rectangleAreaMeasurementsRef.cancelByEsc();
        return;
      } else if (
        // @ts-ignore (конфликт - кастомное свойство _initializer)
        this.$toolsService.commonHandler()._initializer === this.circleAreaMeasurementsRef.toolName
      ) {
        this.circleAreaMeasurementsRef.cancelByEsc();
        return;
      } else if (
        // @ts-ignore (конфликт - кастомное свойство _initializer)
        this.$toolsService.commonHandler()._initializer ===
        this.polygonalAreaMeasurementsRef.toolName
      ) {
        this.polygonalAreaMeasurementsRef.cancelByEsc();
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
