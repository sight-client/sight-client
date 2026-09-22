import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  afterNextRender,
  computed,
  effect,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import chalk from 'chalk';
import * as Cesium from 'cesium';
// -------------------------------------------------------------------- //
// import { RouterLink } from '@angular/router';
// -------------------------------------------------------------------- //
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
// -------------------------------------------------------------------- //
// import {
//   MatDialog,
//   MatDialogActions,
//   MatDialogClose,
//   MatDialogContent,
//   // MatDialogRef,
//   MatDialogTitle,
// } from '@angular/material/dialog';
// -------------------------------------------------------------------- //
// import { CESIUM_PROVIDER } from '@/common/tokens/cesium-tokens'; // вернуть, если будет бэкенд
// -------------------------------------------------------------------- //
import { CheckMobileDeviceService } from '@global/services/check-mobile-device-service/check-mobile-device.service';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { RunViewerDirective } from '@/common/directives/run-viewer-directive/run-viewer.directive';
import { CursorCoordsService } from '@/common/services/cursor-coords-service/cursor-coords.service';
// -------------------------------------------------------------------- //
// -------------------------------------------------------------------- //
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
// -------------------------------------------------------------------- //
import { DrawingService } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { DrawMarkService } from '@/components/tools/drawing-tools/components/draw-mark/services/draw-mark-service/draw-mark.service';
import { DrawLineService } from '@/components/tools/drawing-tools/components/draw-line/services/draw-line-service/draw-line.service';
import { DrawRectangleService } from '@/components/tools/drawing-tools/components/draw-rectangle/services/draw-rectangle-service/draw-rectangle.service';
import { DrawCircleService } from '@/components/tools/drawing-tools/components/draw-circle/services/draw-circle-service/draw-circle.service';
import { DrawPolygonService } from '@/components/tools/drawing-tools/components/draw-polygon/services/draw-polygon-service/draw-polygon.service';
import { EntityRubberService } from '@/components/tools/drawing-tools/components/entity-rubber/services/entity-rubber.service';
// -------------------------------------------------------------------- //
import { MeasureService } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import { CalculateLineService } from '@/components/tools/measuring-tools/components/calculate-line/services/calculate-line-service/calculate-line.service';
import { CalculateRectangleService } from '@/components/tools/measuring-tools/components/calculate-rectangle/services/calculate-rectangle-service/calculate-rectangle.service';
import { CalculateCircleService } from '@/components/tools/measuring-tools/components/calculate-circle/services/calculate-circle-service/calculate-circle.service';
import { CalculatePolygonService } from '@/components/tools/measuring-tools/components/calculate-polygon/services/calculate-polygon-service/calculate-polygon.service';
// -------------------------------------------------------------------- //
import { CameraViewToolsService } from '@/components/tools/camera-view-tools/services/camera-view-tools-service/camera-view-tools.service';
import { FlyAroundService } from '@/components/tools/camera-view-tools/components/fly-around/services/fly-around-service/fly-around.service';
// -------------------------------------------------------------------- //
import { FloatingWindowsService } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';
import { DrawingsListService } from '@/components/tools/drawings-list/services/drawings-list-service/drawings-list.service';
// -------------------------------------------------------------------- //
// -------------------------------------------------------------------- //
// import { UserAccountFeatures } from '@global/components/user-account-features/user-account-features';
import { MainMenu } from '@/components/main-menu/main-menu';
import { CursorCoordsInfo } from '@/components/cursor-coords-info/cursor-coords-info';
import { CameraHeightTool } from './components/camera-position-tools/camera-height-tool/camera-height-tool';
import { ZnemzNavigationMixin } from '@/components/camera-position-tools/znemz-navigation-mixin/znemz-navigation-mixin';
// -------------------------------------------------------------------- //
import { ToolsPanel } from '@/components/tools/tools-panel';
import { FloatingWindowsContainer } from '@/components/floating-windows/floating-windows-container/floating-windows-container';
import { FloatingWindowTabsPanel } from '@/components/floating-windows/floating-windows-tabs-panel/floating-windows-tabs-panel';
import { DrawingsList } from '@/components/tools/drawings-list/drawings-list';
@Component({
  selector: 'planet',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatTabsModule,
    MatTooltipModule,

    RunViewerDirective,
    MainMenu,
    CursorCoordsInfo,
    ToolsPanel,
    FloatingWindowsContainer,
    FloatingWindowTabsPanel,
    DrawingsList,
    ZnemzNavigationMixin,
    CameraHeightTool,
  ],
  templateUrl: './planet.html',
  styleUrl: './planet.scss',
  providers: [
    // CESIUM_PROVIDER,
    ViewerService,
    CursorCoordsService,
    // Main-сервис инструментов правой панели
    ToolsService,
    // Инструменты рисования
    // Common-сервисы для инструментов рисования
    DrawingService,
    // Индивидуальные сервисы инструментов рисования
    DrawMarkService,
    DrawLineService,
    DrawRectangleService,
    DrawCircleService,
    DrawPolygonService,
    EntityRubberService,
    // Инструменты измерения
    // Common-сервис для инструментов измерения
    MeasureService,
    // Индивидуальные сервисы инструментов измерения
    CalculateLineService,
    CalculateRectangleService,
    CalculateCircleService,
    CalculatePolygonService,
    // Инструменты работы с камерой
    // Common-сервис инструментов работы с камерой
    CameraViewToolsService,
    // Индивидуальные сервисы инструментов работы с камерой
    FlyAroundService,
    // Main-сервис плавающих окон
    FloatingWindowsService,
    // Main-сервис для вкладки "Рисование" левой панели
    DrawingsListService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Planet {
  constructor(
    protected $checkMobileDeviceService: CheckMobileDeviceService,
    // protected $userDataService: UserDataService,
    protected $viewerService: ViewerService,
    protected $cursorCoordsService: CursorCoordsService,
    protected $toolsService: ToolsService,
    private $drawingsListService: DrawingsListService,
  ) {
    this.sidenavOpened.set(!this.$checkMobileDeviceService.tabletLayout());
    afterNextRender(() => {
      try {
        // Определение контейнера для отслеживания перемещения курсора мыши (для координат)
        this.$cursorCoordsService.getWatchedContainerRef(this.mainSightContainerRef.nativeElement);
      } catch (error: unknown) {
        if (error instanceof Error) {
          error.cause = 'red';
        }
        throw error;
      }
    });
    effect(() => {
      try {
        if (this.hasNewDrawings()) {
          untracked(() => {
            this.setSelectedTab('Рисование');
          });
        }
      } catch (error: unknown) {
        console.log(chalk.red(error));
      }
    });

    // document.addEventListener('click', (event) => {
    //   console.log(event.target);
    //   // console.log(this.$viewerService.viewer.scene.camera.position);
    //   // console.log(this.$viewerService.viewer.scene.camera.positionCartographic.height);
    // });
  }
  @ViewChild('mainSightContainer') public mainSightContainerRef!: ElementRef<Element>;

  protected readonly sidenavOpened = signal(false);
  private sidenavEdgeSwipeStart: { x: number; y: number } | null = null;

  protected onSidenavEdgeTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) {
      this.sidenavEdgeSwipeStart = null;
      return;
    }
    const touch = event.touches[0];
    this.sidenavEdgeSwipeStart = { x: touch.clientX, y: touch.clientY };
  }

  protected onSidenavEdgeTouchMove(event: TouchEvent, sidenav: MatSidenav): void {
    const start = this.sidenavEdgeSwipeStart;
    if (!start || event.touches.length !== 1 || sidenav.opened) {
      return;
    }
    const touch = event.touches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (dx >= 48 && dx > Math.abs(dy)) {
      this.sidenavEdgeSwipeStart = null;
      this.sidenavOpened.set(true);
      void sidenav.open();
    }
  }

  protected onSidenavEdgeTouchEnd(): void {
    this.sidenavEdgeSwipeStart = null;
  }

  // "Пустой" курсор 1x1 px
  protected emptyCursorStyle: string = 'url(assets/1x1_transparent.png) 0 1, auto';

  // Состав табов - из номенклатуры пользоввательских модулей по БД
  protected tabs = signal<Array<string>>(['Рисование', 'Поиск', 'Пользовательские данные']);
  protected selectedTabIndex = signal<number>(0);
  private setSelectedTab(tabName: string) {
    try {
      const tabNameIndex = this.tabs().findIndex((item) => item === tabName);
      if (tabNameIndex !== -1) {
        if (this.selectedTabIndex() !== tabNameIndex) this.selectedTabIndex.set(tabNameIndex);
        return true;
      } else {
        console.log(chalk.red("tabName hasn't found in setSelectedTab fn"));
        return false;
      }
    } catch (error: unknown) {
      console.log(chalk.red(error));
      if (error instanceof Error) console.log(error.stack);
      return false;
    }
  }
  private readonly linesCounter = computed<number>(() => this.$drawingsListService.linesCounter());
  private readonly hasNewDrawings = linkedSignal<number, boolean>({
    source: this.linesCounter,
    computation(newVal, prevVal) {
      return prevVal?.source === 0 && newVal > 0 ? true : false;
    },
  });
  // -------------------------------------------------------------------------------------- //
  // -------------------------------------------------------------------------------------- //
  // -------------------------------------------------------------------------------------- //
  // Для тестов производительности
  protected benchmarkTest(): void {
    let a = [];
    const start = Date.now();
    for (let i = 0; i < 100000000; i++) {
      a.push(Math.round(Math.random()) * 1000);
    }
    const end = Date.now();
    const time = (end - start) / 1000;
    console.log(`Результат теста: ${time} с.`);
  }
  // readonly dialog = inject(MatDialog);
  // protected openContacts(event: MouseEvent): void {
  //   try {
  //     event.stopPropagation();
  //     this.dialog.open(ContactsDialog, {
  //       id: 'AuthModule',
  //       enterAnimationDuration: 300,
  //       exitAnimationDuration: 300,
  //       hasBackdrop: true,
  //       autoFocus: true,
  //     });
  //   } catch (error) {
  //     console.log('Auth forms opening failed');
  //     throw error;
  //   }
  // }
}

// @Component({
//   selector: 'dialog-animations-example-dialog',
//   imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
//   template: `
//     <div class="greeting-container">
//       <h2 mat-dialog-title>Приветствую!</h2>
//       <mat-dialog-content style="text-align: justify;">
//         <br />Это некоммерческий проект на бесплатном хостинге Github Pages. Я создал его в
//         свободное время для своего
//         <a href="https://hh.ru/resume/8bbb00a0ff0fe0c1af0039ed1f57476e457858">резюме</a>. Если кому
//         пригодится – пользуйтесь на здоровье. Ссылка на репозиторий:
//         <a href="https://github.com/sight-client/sight-client"
//           >https://github.com/sight-client/sight-client</a
//         >
//         <br />Карта работает и на мобильных устройствах. Если буду успевать, планирую добавить
//         поиск, навигацию, площадные измерения, l10n (eng), а также возможность загрузки и
//         отображения на карте пользовательских растровых, векторных и 3d-изображений. <br /><br />Мои
//         контакты: <br />e-mail: <a href="mailto:porphirik@mail.ru">porphirik@mail.ru</a>
//         <br />telegram:
//         <a href="tg://resolve?domain=smollett40k">smollett40k</a>
//       </mat-dialog-content>
//       <mat-dialog-actions>
//         <div class="osm-copyright">
//           <p>
//             Map data from
//             <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap copyright rules"
//               >OpenStreetMap</a
//             >
//           </p>
//         </div>
//         <button matButton mat-dialog-close cdkFocusInitial>Ok</button>
//       </mat-dialog-actions>
//     </div>
//   `,
//   styles: `
//     :host {
//       .greeting-container {
//         background-color: var(--theme-ui-background-color);
//       }
//       .greeting-container mat-dialog-actions {
//         justify-content: space-between;
//       }
//       .osm-copyright {
//         // position: absolute;
//         // right: 104px;
//         // bottom: 15px;
//         // padding-inline: 5px;
//         // background-color: var(--theme-ui-background-color);
//         // border-radius: 5px;
//         // outline: 1px solid var(--theme-outline-color);
//         p {
//           margin: 0;
//         }
//       }
//     }
//   `,
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class ContactsDialog {
//   readonly dialogRef = inject(MatDialogRef<ContactsDialog>);
// }
