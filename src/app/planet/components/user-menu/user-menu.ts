import { ChangeDetectionStrategy, Component, ViewChild, inject } from '@angular/core';
// import chalk from 'chalk';
// import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  // MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

import { LightDarkModeSwitcher } from '@global/components/theme-changer/components/light-dark-mode-switcher/light-dark-mode-switcher';
import { ThemeColorChanger } from '@global/components/theme-changer/components/theme-color-changer/theme-color-changer';

// import { AccountFeatures } from '@global/components/account-features/account-features';
// import { UserDataService } from '@global/services/user-data-service/user-data.service';

@Component({
  selector: 'user-menu',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,

    // AccountFeatures,
    LightDarkModeSwitcher,
    ThemeColorChanger,
  ],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenu {
  constructor(
    // private router: Router,
    // protected $userDataService: UserDataService,
  ) {}

  // @ViewChild(AccountFeatures) accountFeaturesRef: AccountFeatures;
  @ViewChild(LightDarkModeSwitcher) lightDarkModeSwitcherRef: LightDarkModeSwitcher;
  @ViewChild(ThemeColorChanger) themeColorChangerRef: ThemeColorChanger;

  // protected goToLanding() {
  //   this.router.navigate(['/landing']);
  // }

  readonly dialog = inject(MatDialog);
  protected openContacts(_event: MouseEvent): void {
    try {
      // _event.stopPropagation();
      this.dialog.open(ContactsDialog, {
        id: 'AboutProject',
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
        <br />Карта работает и на мобильных устройствах. Если буду успевать, планирую добавить
        поиск, навигацию, l10n (eng), а также возможность загрузки и отображения на карте
        пользовательских растровых, векторных и 3d-изображений. <br /><br />Мои контакты:
        <br />e-mail: <a href="mailto:porphirik@mail.ru">porphirik@mail.ru</a> <br />telegram:
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
