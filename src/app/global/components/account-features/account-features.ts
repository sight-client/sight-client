import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  untracked,
  Input,
} from '@angular/core';
import chalk from 'chalk';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UserDataService } from '@global/services/user-data-service/user-data.service';
import { AuthModule } from '@global/components/account-features/components/auth-module/auth-module';

@Component({
  selector: 'account-features',
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  templateUrl: './account-features.html',
  styleUrl: './account-features.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountFeatures {
  @Input() inMenu: boolean;
  // Сервис функционала авторизации и регистрации пользователей
  constructor(protected $userDataService: UserDataService) {
    this.$userDataService.clearAuthResults();
    effect(() => {
      if (typeof this.$userDataService.userName() === 'string') {
        untracked(() => {
          // Срабатывает после успешной авторизации (освобождает submit-кнопку из форм)
          this.dialog.getDialogById('AuthModule')?.close();
          this.dialog
            .getDialogById('AuthModule')
            ?.afterClosed()
            .subscribe(() => {
              this.$userDataService.clearRegFormValuesReserv();
            });
        });
      }
    });
  }
  readonly dialog = inject(MatDialog);
  public openAuthModal(): void {
    try {
      // Событие не перехватвать (нужно для mat-menu)
      // event.stopPropagation();
      this.$userDataService.clearAuthResults();
      this.dialog.open(AuthModule, {
        id: 'AuthModule',
        // Ограничение на непреднамеренное закрытие модалки через функциональность mat-dialog
        closePredicate: () => {
          if (
            (this.$userDataService.loginConnectionSubscription &&
              !this.$userDataService.loginConnectionSubscription.closed) ||
            (this.$userDataService.registrationConnectionSubscription &&
              !this.$userDataService.registrationConnectionSubscription.closed) ||
            (this.$userDataService.logoutConnectionSubscription &&
              !this.$userDataService.logoutConnectionSubscription.closed)
          ) {
            return false;
          } else {
            return true;
          }
        },
        minWidth: 400,
        enterAnimationDuration: 300,
        exitAnimationDuration: 300,
        hasBackdrop: true,
        autoFocus: false, // выставлен вручную
      });
      // this.$userDataService.userName.set('user');
    } catch (error) {
      console.log(chalk.red('Auth forms opening failed'));
      throw error;
    }
  }
  public clickFromParentMenu(): void {
    if (this.$userDataService.userName()) {
      this.$userDataService.getLogoutSubscription();
    } else {
      this.openAuthModal();
    }
  }
}
