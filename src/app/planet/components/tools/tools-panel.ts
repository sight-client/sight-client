import { reportError } from '@global/lib/report-error.lib';
import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
  ViewChild,
  ViewContainerRef,
  TemplateRef,
  ViewRef,
  ElementRef,
  EmbeddedViewRef,
  AfterViewInit,
  OnInit,
  OnDestroy,
  Signal,
  WritableSignal,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { first, repeat, Subscription } from 'rxjs';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import {
  setNormalButtonsVisibility,
  showAuxiliarySubgroup,
  hideAuxiliarySubgroup,
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

interface ToolGroup {
  templates: Signal<readonly TemplateRef<unknown>[]>;
  defaultVcr: Signal<ViewContainerRef>;
  hiddenVcr: Signal<ViewContainerRef>;
  defaultDiv: Signal<ElementRef<HTMLElement>>;
  hiddenDiv: Signal<ElementRef<HTMLElement>>;
  expanded: WritableSignal<boolean>;
  outsideClickIgnore: string;
}

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
            [class.tool-panel-button-svg-mirrored]="drawingTools.expanded() === true"
            class="tool-chevron-button drawind-tools-chevron-button"
            matButton="tonal"
            (click)="toggleHiddenVisibility(drawingTools, $event)"
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
            drawingTools.expanded() === true ? 'tools-panel-group-hidden-raised' : ''
          "
          #hiddenDivForDrawingTools
          (mousedown)="moveToolToDefault($event, drawingTools)"
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
            [class.tool-panel-button-svg-mirrored]="measuringTools.expanded() === true"
            class="tool-chevron-button measuring-tools-chevron-button"
            matButton="tonal"
            (click)="toggleHiddenVisibility(measuringTools, $event)"
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
            measuringTools.expanded() === true ? 'tools-panel-group-hidden-raised' : ''
          "
          #hiddenDivForMeasuringTools
          (mousedown)="moveToolToDefault($event, measuringTools)"
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
            [class.tool-panel-button-svg-mirrored]="cameraTools.expanded() === true"
            class="tool-chevron-button camera-view-tools-chevron-button"
            matButton="tonal"
            (click)="toggleHiddenVisibility(cameraTools, $event)"
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
            cameraTools.expanded() === true ? 'tools-panel-group-hidden-raised' : ''
          "
          #hiddenDivForCameraViewTools
          (mousedown)="moveToolToDefault($event, cameraTools)"
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

  private readonly drawingTemplates = viewChildren('childNGTForDrawingTools', { read: TemplateRef });
  private readonly drawingDefaultVcr = viewChild.required('defaultNGCForDrawingTools', {
    read: ViewContainerRef,
  });
  private readonly drawingHiddenVcr = viewChild.required('hiddenNGCForDrawingTools', {
    read: ViewContainerRef,
  });
  private readonly drawingDefaultDiv = viewChild.required('defaultDivForDrawingTools', {
    read: ElementRef,
  });
  private readonly drawingHiddenDiv = viewChild.required('hiddenDivForDrawingTools', {
    read: ElementRef,
  });
  private readonly measuringTemplates = viewChildren('childNGTForMeasuringTools', {
    read: TemplateRef,
  });
  private readonly measuringDefaultVcr = viewChild.required('defaultNGCForMeasuringTools', {
    read: ViewContainerRef,
  });
  private readonly measuringHiddenVcr = viewChild.required('hiddenNGCForMeasuringTools', {
    read: ViewContainerRef,
  });
  private readonly measuringDefaultDiv = viewChild.required('defaultDivForMeasuringTools', {
    read: ElementRef,
  });
  private readonly measuringHiddenDiv = viewChild.required('hiddenDivForMeasuringTools', {
    read: ElementRef,
  });
  private readonly cameraTemplates = viewChildren('childNGTForCameraViewTools', { read: TemplateRef });
  private readonly cameraDefaultVcr = viewChild.required('defaultNGCForCameraViewTools', {
    read: ViewContainerRef,
  });
  private readonly cameraHiddenVcr = viewChild.required('hiddenNGCForCameraViewTools', {
    read: ViewContainerRef,
  });
  private readonly cameraDefaultDiv = viewChild.required('defaultDivForCameraViewTools', {
    read: ElementRef,
  });
  private readonly cameraHiddenDiv = viewChild.required('hiddenDivForCameraViewTools', {
    read: ElementRef,
  });
  protected readonly drawingTools: ToolGroup = {
    templates: this.drawingTemplates,
    defaultVcr: this.drawingDefaultVcr,
    hiddenVcr: this.drawingHiddenVcr,
    defaultDiv: this.drawingDefaultDiv,
    hiddenDiv: this.drawingHiddenDiv,
    expanded: signal(false),
    outsideClickIgnore: '.drawind-tools-chevron-button',
  };
  protected readonly measuringTools: ToolGroup = {
    templates: this.measuringTemplates,
    defaultVcr: this.measuringDefaultVcr,
    hiddenVcr: this.measuringHiddenVcr,
    defaultDiv: this.measuringDefaultDiv,
    hiddenDiv: this.measuringHiddenDiv,
    expanded: signal(false),
    outsideClickIgnore: '.measuring-tools-chevron-button',
  };
  protected readonly cameraTools: ToolGroup = {
    templates: this.cameraTemplates,
    defaultVcr: this.cameraDefaultVcr,
    hiddenVcr: this.cameraHiddenVcr,
    defaultDiv: this.cameraDefaultDiv,
    hiddenDiv: this.cameraHiddenDiv,
    expanded: signal(false),
    outsideClickIgnore: '.camera-view-tools-chevron-button',
  };
  private readonly toolGroups = [this.drawingTools, this.measuringTools, this.cameraTools];

  ngAfterViewInit() {
    for (const group of this.toolGroups) {
      this.renderToolsGroupTemplates(group);
    }
  }

  private renderToolsGroupTemplates(group: ToolGroup): boolean {
    const childrenQLTR = group.templates();
    const defaultNGCVCR = group.defaultVcr();
    const hiddenNGCVCR = group.hiddenVcr();
    const defaultDivER = group.defaultDiv();
    const hiddenDivER = group.hiddenDiv();
    const hiddenDivHasShown = group.expanded;
    try {
      const firstTR = childrenQLTR[0];
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
                'View detach has failed in renderToolsGroupTemplates fn',
              );
          }
        }
      }
      // Установка начальных значений кастомного атрибута хостов компонентов, входящих в группы, служащего для управления видимостью их кнопок
      if (setNormalButtonsVisibility(defaultDivER, hiddenDivER) === true) {
        hiddenDivHasShown.set(false);
        // console.log(hiddenDivHasShown());
        return true;
      } else {
        console.info('setNormalButtonsVisibility fn has failed');
        return false;
      }
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  // Метод для клика по кнопке внутри вспомогательного контейнера группы
  protected moveToolToDefault(event: MouseEvent, group: ToolGroup): boolean {
    const defaultNGCVCR = group.defaultVcr();
    const hiddenNGCVCR = group.hiddenVcr();
    const defaultDivER = group.defaultDiv();
    const hiddenDivER = group.hiddenDiv();
    const hiddenDivHasShown = group.expanded;
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
        this.offHiddenVisibility(group);
        throw new Error("Event's bubbling hasn't contained button element");
      }

      // ------------------------------ //
      // Перемещение между контейнерами
      // ------------------------------ //

      // Проверка на наличие кастомного атрибута 'position' хоста кнопки в дефолтном контейнере
      const defaultBtnEl = defaultDivER.nativeElement.firstChild;
      const defaultBtnElPositionAttr =
        defaultBtnEl instanceof HTMLElement ? defaultBtnEl.getAttribute('position') : null;
      const defaultBtnElPosition = Number(defaultBtnElPositionAttr);

      // Перенос заменяемой кнопки из дефолтного обратно в скрываемый контейнер
      // Сценарий с сохранением порядка очередности инструментов (используется кастомный атрибут 'position')
      if (defaultBtnElPositionAttr !== null && Number.isFinite(defaultBtnElPosition)) {
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
              const hiddenChild = hidArr[i];
              if (hiddenChild instanceof HTMLElement) {
                const thisElPosAttr = hiddenChild.getAttribute('position');
                const thisElPos = Number(thisElPosAttr);
                if (thisElPosAttr === null || !Number.isFinite(thisElPos)) {
                  console.info(
                    'Position attribute is not valid in hiddenDiv\'s "for"-cicle: ',
                    thisElPosAttr,
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
                console.info('indexInVCRToPaste is not defined');
                console.info('Searched in ', hidArr);
                console.info("Insert without using tool's positions");
              } else throw new Error('View detach has failed in moveToolToDefault fn');
            }
          }
        }
        // Сценарий без учета порядка очередности кнопок
      } else {
        const detachedViewPrev = defaultNGCVCR.detach(0);
        if (detachedViewPrev) {
          hiddenNGCVCR.insert(detachedViewPrev);
          console.info(`defaultBtnElPositionAttr === ${defaultBtnElPositionAttr}`);
          console.info("Insert without using tool's positions");
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
        console.info(hiddenChildren);
        console.info(btnElHost);
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
      reportError(error);
      return false;
    }
  }

  // ---------------------------------------------------------------------------------------------------------------- //
  // Методы управления видимостью кнопок инструментов, входящих в группы
  // ---------------------------------------------------------------------------------------------------------------- //

  @HostListener('document:click', ['$event'])
  // Метод для клика вне границ контейнеров для вспомогательных подгрупп
  handleForOutOfHiddenGroupBoundariesClick(event: MouseEvent): void {
    for (const group of this.toolGroups) {
      if (group.expanded() !== true) continue;
      const hiddenDiv = group.hiddenDiv()?.nativeElement;
      if (!hiddenDiv) {
        console.info('"hiddenDivER" was not defined in out-of-boundaries handler');
        continue;
      }
      if (
        event.target instanceof Element &&
        hiddenDiv.contains(event.target) === false &&
        !event.target.closest(group.outsideClickIgnore)
      ) {
        if (hideAuxiliarySubgroup(group.hiddenDiv()) === true) {
          group.expanded.set(false);
        } else {
          console.info(
            `Hiding ${hiddenDiv.tagName} button by Esc has failed in outOfBoundaries handler`,
          );
        }
      }
    }
  }

  // Метод для клика по кнопке, переключающей видимость вспомогательной подгруппы кнопок
  protected toggleHiddenVisibility(group: ToolGroup, _event?: MouseEvent): boolean {
    const hiddenDivER = group.hiddenDiv();
    const hiddenDivHasShown = group.expanded;
    try {
      // _event.stopPropagation(); // не перехватывать, нужно для this.handleForOutOfHiddenGroupBoundariesClick()
      if (hiddenDivHasShown() === false) {
        if (showAuxiliarySubgroup(hiddenDivER)) {
          hiddenDivHasShown.set(true);
          // console.log(hiddenDivHasShown());
          return true;
        } else {
          console.info('showAuxiliarySubgroup fn has failed');
          return false;
        }
      } else if (hiddenDivHasShown() === true) {
        if (hideAuxiliarySubgroup(hiddenDivER)) {
          hiddenDivHasShown.set(false);
          // console.log(hiddenDivHasShown());
          return true;
        } else {
          console.info('hideAuxiliarySubgroup fn has failed');
          return false;
        }
      } else
        throw new Error('"hiddenDivHasShown" signal is not defined in toggleHiddenVisibility fn');
    } catch (error: unknown) {
      reportError(error);
      return false;
    }
  }

  // Метод для прослушивателя нажатия Esc
  protected offHiddenVisibility(group: ToolGroup): boolean {
    const hiddenDivER = group.hiddenDiv();
    const hiddenDivHasShown = group.expanded;
    try {
      // event.stopPropagation(); // уже остановлено в общем хэндлере
      if (hideAuxiliarySubgroup(hiddenDivER)) {
        hiddenDivHasShown.set(false);
        // console.log(hiddenDivHasShown());
        return true;
      } else return false;
    } catch (error: unknown) {
      reportError(error);
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
          console.info(`Canceled because tool's error has detected (from tool "${data}")`);
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
      reportError(error);
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
      for (const group of this.toolGroups) {
        if (group.expanded() === true) this.offHiddenVisibility(group);
      }
    } catch (error: unknown) {
      reportError(error);
    }
  }

  // Деактивация инструментов по Esc
  private handleForEscToolDeactivation(_event?: Event): void {
    try {
      const initializer = this.$toolsService?.commonHandler?.()?._initializer;
      if (!initializer) return;
      // Инструменты рисования
      if (initializer === this.drawMarkRef.toolName) {
        this.drawMarkRef.cancelByEsc();
        return;
      }
      else if (initializer === this.drawLineRef.toolName) {
        this.drawLineRef.cancelByEsc();
        return;
      }
      else if (initializer === this.drawRectangleRef.toolName) {
        this.drawRectangleRef.cancelByEsc();
        return;
      }
      else if (initializer === this.drawCircleRef.toolName) {
        this.drawCircleRef.cancelByEsc();
        return;
      }
      else if (initializer === this.drawPolygonRef.toolName) {
        this.drawPolygonRef.cancelByEsc();
        return;
      } else if (initializer === this.entityRubberRef.toolName) {
        this.entityRubberRef.cancelByEsc();
        return;
      }

      // Инструменты измерения
      else if (
        initializer === this.calculateLineRef.toolName
      ) {
        this.calculateLineRef.cancelByEsc();
        return;
      } else if (
        initializer ===
        this.calculateRectangleRef.toolName
      ) {
        this.calculateRectangleRef.cancelByEsc();
        return;
      } else if (
        initializer === this.calculateCircleRef.toolName
      ) {
        this.calculateCircleRef.cancelByEsc();
        return;
      } else if (
        initializer ===
        this.calculatePolygonRef.toolName
      ) {
        this.calculatePolygonRef.cancelByEsc();
        return;
      }

      // Инструменты измерения
      else if (
        initializer === this.flyAroundRef.toolName ||
        initializer === this.flyAroundRef.toolNameAlt
      ) {
        this.flyAroundRef.cancelByEsc();
        return;
      }
    } catch (error: unknown) {
      reportError(error);
    }
  }

  protected visibleWindow(chapterId: string) {
    const element = document.getElementById(chapterId);
    if (!element) return;
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
  }
}
