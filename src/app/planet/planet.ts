import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  afterNextRender,
  computed,
  signal,
  inject,
} from '@angular/core';
// import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  // MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

import { DeviceService } from '@global/services/device-service/device.service';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { AppCesiumDirective } from '@/common/directives/app-cesium-directive/app-cesium.directive';
import { MouseCoordsService } from '@/common/services/mouse-coords-service/mouse-coords.service';
import { MeasureService } from '@/common/services/measure-service/measure.service';

// import { CESIUM_PROVIDER } from '@/common/tokens/cesium-tokens';

import { ThemeChanger } from '@global/components/theme-changer/theme-changer';
// import { AccountFeatures } from '@global/components/account-features/account-features';
import { MouseCoordsInfo } from '@/components/mouse-coords-info/mouse-coords-info';
import { MeasuringTools } from '@/components/measuring-tools/measuring-tools';
import { CameraHeightTool } from './components/camera-position-tools/camera-height-tool/camera-height-tool';
import { ZnemzNavigationMixin } from '@/components/camera-position-tools/znemz-navigation-mixin/znemz-navigation-mixin';
import { SceneModeChanger } from '@/components/camera-position-tools/scene-mode-changer/scene-mode-changer';

@Component({
  selector: 'planet',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatTabsModule,
    // RouterLink,
    AppCesiumDirective,
    ThemeChanger,
    // AccountFeatures,
    MouseCoordsInfo,
    MeasuringTools,
    CameraHeightTool,
    ZnemzNavigationMixin,
    SceneModeChanger,
  ],
  templateUrl: './planet.html',
  styleUrl: './planet.scss',
  providers: [
    ViewerService,
    MouseCoordsService,
    MeasureService,
    // CESIUM_PROVIDER,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Planet {
  constructor(
    protected $viewerService: ViewerService,
    protected $mouseCoordsService: MouseCoordsService,
    protected $measureService: MeasureService,
    protected $deviceService: DeviceService,
  ) {
    afterNextRender(() => {
      try {
        // Определение контейнера для отслеживания перемещения курсора мыши (для координат)
        this.$mouseCoordsService.getWatchedContainerRef(this.mainSightContainerRef.nativeElement);
      } catch (error: any) {
        error.cause = 'red';
        throw error;
      }
    });
  }
  @ViewChild('mainSightContainer') public mainSightContainerRef!: ElementRef<Element>;

  readonly dialog = inject(MatDialog);
  protected openContacts(event: MouseEvent): void {
    try {
      event.stopPropagation();
      this.dialog.open(ContactsDialog, {
        id: 'AuthModule',
        enterAnimationDuration: 300,
        exitAnimationDuration: 300,
        hasBackdrop: true,
        autoFocus: true,
      });
    } catch (error) {
      console.log('Auth forms opening failed');
      throw error;
    }
  }

  // Состав табов - из номенклатуры пользоввательских модулей по БД
  protected tabs = signal<Array<string>>(['Поиск', 'Навигация', 'Пользовательские данные']);
  protected selectedTab = signal<number>(0);

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
}

@Component({
  selector: 'dialog-animations-example-dialog',
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  template: `
    <div class="greeting-container">
      <h2 mat-dialog-title>Приветствую!</h2>
      <mat-dialog-content style="text-align: justify;">
        <br />Это некоммерческий проект на бесплатном хостинге Github Pages. Я создал его в
        свободное время для своего
        <a href="https://hh.ru/resume/8bbb00a0ff0fe0c1af0039ed1f57476e457858">резюме</a>. Если кому
        пригодится – пользуйтесь на здоровье. Ссылка на репозиторий:
        <a href="https://github.com/sight-client/sight-client"
          >https://github.com/sight-client/sight-client</a
        >
        <br />Карта работает и на мобильных устройствах. Если буду успевать, планирую добавить
        поиск, навигацию, площадные измерения, l10n (eng), а также возможность загрузки и
        отображения на карте пользовательских растровых, векторных и 3d-изображений. <br /><br />Мои
        контакты: <br />e-mail: <a href="mailto:porphirik@mail.ru">porphirik@mail.ru</a>
        <br />telegram:
        <a href="tg://resolve?domain=smollett40k">smollett40k</a>
      </mat-dialog-content>
      <mat-dialog-actions>
        <div class="osm-copyright">
          <p>
            Map data from
            <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap copyright rules"
              >OpenStreetMap</a
            >
          </p>
        </div>
        <button matButton mat-dialog-close cdkFocusInitial>Ok</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: `
    :host {
      .greeting-container {
        background-color: var(--theme-ui-background-color);
      }
      .greeting-container mat-dialog-actions {
        justify-content: space-between;
      }
      .osm-copyright {
        // position: absolute;
        // right: 104px;
        // bottom: 15px;
        // padding-inline: 5px;
        // background-color: var(--theme-ui-background-color);
        // border-radius: 5px;
        // outline: 1px solid var(--theme-outline-color);
        p {
          margin: 0;
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsDialog {
  // readonly dialogRef = inject(MatDialogRef<ContactsDialog>);
}
