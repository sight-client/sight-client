import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  afterNextRender,
  inject,
} from '@angular/core';
// import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

import { AppCesiumDirective } from '@/common/directives/app-cesium-directive/app-cesium.directive';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { MouseCoordsService } from '@/common/services/mouse-coords-service/mouse-coords.service';
import { MeasureService } from '@/common/services/measure-service/measure.service';

// import { CESIUM_PROVIDER } from '@/common/tokens/cesium-tokens';

import { MouseCoordsInfo } from '@/components/mouse-coords-info/mouse-coords-info';
import { CameraHeightTool } from './components/camera-position-tools/camera-height-tool/camera-height-tool';
import { ZnemzNavigationMixin } from '@/components/camera-position-tools/znemz-navigation-mixin/znemz-navigation-mixin';
import { MeasuringTools } from '@/components/measuring-tools/measuring-tools';
import { SceneModeChanger } from '@/components/camera-position-tools/scene-mode-changer/scene-mode-changer';

import { ThemeChanger } from '@global/components/theme-changer/theme-changer';
// import { AccountFeatures } from '@global/components/account-features/account-features';

@Component({
  selector: 'planet',
  imports: [
    MatButtonModule,
    MatIconModule,
    // RouterLink,
    AppCesiumDirective,
    ThemeChanger,
    MouseCoordsInfo,
    MeasuringTools,
    CameraHeightTool,
    ZnemzNavigationMixin,
    SceneModeChanger,
    // AccountFeatures,
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
  ) {
    afterNextRender(() => {
      try {
        this.$mouseCoordsService.getWatchedContainerRef(this.mainOkoContainerRef.nativeElement);
      } catch (error: any) {
        error.cause = 'red';
        throw error;
      }
    });
  }
  @ViewChild('mainOkoContainer') public mainOkoContainerRef!: ElementRef<Element>;
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
        <br />Если буду успевать, планирую добавить поиск, навигацию, площадные измерения, l10n
        (eng), а также возможность загрузки и отображения на карте пользовательских растровых,
        векторных и 3d-изображений. <br /><br />Мои контакты: <br />e-mail:
        <a href="mailto:porphirik@mail.ru">porphirik@mail.ru</a> <br />telegram:
        <a href="tg://resolve?domain=smollett40k">smollett40k</a>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button matButton mat-dialog-close cdkFocusInitial>Ok</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: `
    .greeting-container {
      background-color: var(--theme-ui-background-color);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsDialog {
  // readonly dialogRef = inject(MatDialogRef<ContactsDialog>);
}
