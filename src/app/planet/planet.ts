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
import { MatSidenavModule } from '@angular/material/sidenav';
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
import { DeviceService } from '@global/services/device-service/device.service';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { AppCesiumDirective } from '@/common/directives/app-cesium-directive/app-cesium.directive';
import { MouseCoordsService } from '@/common/services/mouse-coords-service/mouse-coords.service';
// -------------------------------------------------------------------- //
// -------------------------------------------------------------------- //
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
// -------------------------------------------------------------------- //
import { DrawingService } from '@/components/tools/drawing-tools/services/drawing-service/drawing.service';
import { AddMarkService } from '@/components/tools/drawing-tools/components/add-mark/services/add-mark-service/add-mark.service';
import { AddLineService } from '@/components/tools/drawing-tools/components/add-line/services/add-line-service/add-line.service';
import { AddRectangleService } from '@/components/tools/drawing-tools/components/add-rectangle/services/add-rectangle-service/add-rectangle.service';
import { AddCircleService } from '@/components/tools/drawing-tools/components/add-circle/services/add-circle-service/add-circle.service';
import { AddPolygonService } from '@/components/tools/drawing-tools/components/add-polygon/services/add-polygon-service/add-polygon.service';
import { EraseEntityService } from '@/components/tools/drawing-tools/components/erase-entity/services/erase-entity.service';
// -------------------------------------------------------------------- //
import { MeasureService } from '@/components/tools/measuring-tools/services/measure-service/measure.service';
import { LinearMeasurementsService } from '@/components/tools/measuring-tools/components/linear-measurements/services/linear-measurements-service/linear-measurements.service';
import { RectangleAreaMeasurementsService } from '@/components/tools/measuring-tools/components/rectangle-area-measurements/services/rectangle-area-measurements-service/rectangle-area-measurements.service';
import { CircleAreaMeasurementsService } from '@/components/tools/measuring-tools/components/circle-area-measurements/services/circle-area-measurements-service/circle-area-measurements.service';
import { PolygonalAreaMeasurementsService } from '@/components/tools/measuring-tools/components/polygonal-area-measurements/services/polygonal-area-measurements-service/polygonal-area-measurements.service';
// -------------------------------------------------------------------- //
import { CameraToolsService } from '@/components/tools/camera-tools/services/camera-tools-service/camera-tools.service';
import { FlyAroundService } from '@/components/tools/camera-tools/components/fly-around/services/fly-around-service/fly-around.service';
// -------------------------------------------------------------------- //
import { FloatingWindowsService } from '@/components/floating-windows/services/floating-windows-service/floating-windows.service';
import { ToolsListService } from '@/components/tools/tools-list/services/tools-list-service/tools-list.service';
// -------------------------------------------------------------------- //
// -------------------------------------------------------------------- //
// import { AccountFeatures } from '@global/components/account-features/account-features';
import { UserMenu } from '@/components/user-menu/user-menu';
import { MouseCoordsInfo } from '@/components/mouse-coords-info/mouse-coords-info';
import { CameraHeightTool } from './components/camera-position-tools/camera-height-tool/camera-height-tool';
import { ZnemzNavigationMixin } from '@/components/camera-position-tools/znemz-navigation-mixin/znemz-navigation-mixin';
// -------------------------------------------------------------------- //
import { ToolsPanel } from '@/components/tools/tools-panel';
import { FloatingWindowsContainer } from '@/components/floating-windows/floating-windows-container/floating-windows-container';
import { FloatingWindowTabsPanel } from '@/components/floating-windows/floating-windows-tabs-panel/floating-windows-tabs-panel';
import { ToolsList } from '@/components/tools/tools-list/tools-list';
@Component({
  selector: 'planet',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatTabsModule,
    MatTooltipModule,

    AppCesiumDirective,
    UserMenu,
    MouseCoordsInfo,
    ToolsPanel,
    FloatingWindowsContainer,
    FloatingWindowTabsPanel,
    ToolsList,
    ZnemzNavigationMixin,
    CameraHeightTool,
  ],
  templateUrl: './planet.html',
  styleUrl: './planet.scss',
  providers: [
    // CESIUM_PROVIDER,
    ViewerService,
    MouseCoordsService,
    // Main-сервис инструментов правой панели
    ToolsService,
    // Инструменты рисования
    // Common-сервисы для инструментов рисования
    DrawingService,
    // Индивидуальные сервисы инструментов рисования
    AddMarkService,
    AddLineService,
    AddRectangleService,
    AddCircleService,
    AddPolygonService,
    EraseEntityService,
    // Инструменты измерения
    // Common-сервис для инструментов измерения
    MeasureService,
    // Индивидуальные сервисы инструментов измерения
    LinearMeasurementsService,
    RectangleAreaMeasurementsService,
    CircleAreaMeasurementsService,
    PolygonalAreaMeasurementsService,
    // Инструменты работы с камерой
    // Common-сервис инструментов работы с камерой
    CameraToolsService,
    // Индивидуальные сервисы инструментов работы с камерой
    FlyAroundService,
    // Main-сервис плавающих окон
    FloatingWindowsService,
    // Main-сервис для вкладки "Рисование" левой панели
    ToolsListService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Planet {
  constructor(
    protected $deviceService: DeviceService,
    // protected $userDataService: UserDataService,
    protected $viewerService: ViewerService,
    protected $mouseCoordsService: MouseCoordsService,
    protected $toolsService: ToolsService,
    private $toolsListService: ToolsListService,
  ) {
    afterNextRender(() => {
      try {
        // Определение контейнера для отслеживания перемещения курсора мыши (для координат)
        this.$mouseCoordsService.getWatchedContainerRef(this.mainSightContainerRef.nativeElement);
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
  private readonly linesCounter = computed<number>(() => this.$toolsListService.linesCounter());
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
