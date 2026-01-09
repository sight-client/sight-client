import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  signal,
  ViewChild,
  OnInit,
  OnDestroy,
} from '@angular/core';
import chalk from 'chalk';

import { UserDataService } from '@global/services/user-data-service/user-data.service';
import { UserRegistrationData } from '@global/services/user-data-service/user-data.service';
import { AutofocusDirective } from '@global/directives/autofocus-directive/autofocus.directive';

import {
  FormGroup,
  FormsModule,
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  // MatDialogRef,
} from '@angular/material/dialog';

// Конструктор для валидации пользовательских данных форм
export class CustomErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    /** Error when invalid control is dirty, touched, or submitted. */
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'auth-module',
  imports: [
    AutofocusDirective,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './auth-module.html',
  styleUrl: './auth-module.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthModule implements OnInit, OnDestroy {
  // Сервис функционала авторизации и регистрации пользователей
  constructor(
    protected $userDataService: UserDataService,
    // private dialogRef: MatDialogRef<AuthModule>,
  ) {}
  // Матчер для валидации данных формы
  protected authModuleInputsMatcher = new CustomErrorStateMatcher();

  // ---------------------------------------------------------------------------------------------- /
  // Логика отображения меню
  protected showLoginForm = signal<boolean>(true);
  protected showRegForm = signal<boolean>(false);
  protected openRegForm(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (!this.$userDataService.userName()) {
      this.$userDataService.clearAuthResults();
      if (this.showLoginForm()) this.showLoginForm.set(false);
      if (!this.showRegForm()) this.showRegForm.set(true);
    }
  }
  protected closeRegForm(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.$userDataService.clearAuthResults();
    if (this.showRegForm()) this.showRegForm.set(false);
    if (!this.showLoginForm()) this.showLoginForm.set(true);
  }
  // -------------------------------------------------------- //
  // deprecated. Контролируется родителем и функциональностью mat-dialog
  // protected closeAuthForms(event?: MouseEvent): void {
  //   if (event) event.stopPropagation();
  //   this.$userDataService.clearAuthResults();
  //   this.dialogRef.close();
  // }
  // -------------------------------------------------------- //
  // Для блокировки вспомогательных кнопок формы (с type="button") при ожидании ответа от сервера
  protected logFormIsDisabled = signal<boolean>(false);
  protected regFormIsDisabled = signal<boolean>(false);

  // ---------------------------------------------------------------------------------------------- //
  // ФОРМА РЕГИСТРАЦИИ
  // Синхронная валидация (задействован второй аргумент конструктора FormControl) с мнгновенными проверками реактивных инпутов на незаполненность и неверную конструкцию.
  // Логин должен быть длиной от 3 до 50 символов и может содержать латиницу, цифры и спецсимволы - и _
  protected loginRegFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(50),
    Validators.pattern(/^[A-Za-z0-9_-]{3,50}$/), // {3,50} - резервная проверка на длину
  ]);
  // Пароль должен быть длиной от 8 до 50 символов и содержать, как минимум, одну цифру, одну заглавную и одну строчную букву и один разрешенный специальный символ.
  protected passwordRegFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(50),
    Validators.pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[-_\.~!*'();?:@&=+$,])[A-Za-z\d-_\.~!*'();?:@&=+$,]{8,50}$/,
    ),
  ]);
  // Имя должно быть не пустым
  protected firstNameFormControl = new FormControl('', [Validators.required]);
  // Фамилия должна быть не пустой
  protected lastNameFormControl = new FormControl('', [Validators.required]);
  // Организация может быть пустой
  protected organizationFormControl = new FormControl('');
  // Телефон может быть пустым
  protected telephoneFormControl = new FormControl('');
  // Email должен быть похож на email
  protected emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  // Реактивный объект для отправки данных регистрации
  protected userRegForm = new FormGroup({
    login: this.loginRegFormControl,
    password: this.passwordRegFormControl,
    firstName: this.firstNameFormControl,
    lastName: this.lastNameFormControl,
    organization: this.organizationFormControl,
    telephone: this.telephoneFormControl,
    email: this.emailFormControl,
  });
  // Отправка данных регистрации серверу (по кнопке)
  protected submitRegistration(event: SubmitEvent): void {
    // Контрольная проверка (в дополнение к "[disabled]="!userRegForm.valid"" в шаблоне)
    if (
      this.loginRegFormControl.errors ||
      this.passwordRegFormControl.errors ||
      this.firstNameFormControl.errors ||
      this.lastNameFormControl.errors ||
      this.emailFormControl.errors
    ) {
      event.preventDefault();
      console.log(chalk.blue('Невалидные данные формы для регистрации!'));
      alert('Невалидные данные формы для регистрации!');
      return;
    }
    const regDataObj: UserRegistrationData = new UserRegistrationData(
      this.userRegForm.value.login,
      this.userRegForm.value.password,
      this.userRegForm.value.firstName,
      this.userRegForm.value.lastName,
      this.userRegForm.value.organization,
      this.userRegForm.value.telephone,
      this.userRegForm.value.email,
    );
    // Блокировка формы (привязанных к ней элементов) на время отработки сетевого запроса
    this.userRegForm.disable();
    // Блокировка остальных элементов в диалоговом окне
    this.regFormIsDisabled.set(true);
    this.$userDataService.getRegistrationSubscription(regDataObj).add(() => {
      this.regFormIsDisabled.set(false);
      this.userRegForm.enable();
      if (this.$userDataService.registrationResult() === true) {
        alert('Регистрация прошла успешно');
      }
    });
  }

  // ---------------------------------------------------------------------------------------------- //
  // ФОРМА АВТОРИЗАЦИИ
  protected loginLogFormControl = new FormControl('', [Validators.required]);
  protected passwordLogFormControl = new FormControl('', [Validators.required]);
  // Реактивный объект для отправки данных авторизации
  protected userLoginForm = new FormGroup({
    login: this.loginLogFormControl,
    password: this.passwordLogFormControl,
  });
  // Отправка данных авторизации серверу (по кнопке)
  protected submitLogin(event: SubmitEvent | Event): void {
    if (this.loginLogFormControl.errors || this.passwordLogFormControl.errors) {
      event.preventDefault();
      console.log(chalk.blue('Невалидные данные формы для входа!'));
      alert('Невалидные данные формы для входа!');
      return;
    }
    this.logFormIsDisabled.set(true);
    this.userLoginForm.disable();
    this.$userDataService
      .getLoginSubscription(this.userLoginForm.value.login, this.userLoginForm.value.password)
      .add(() => {
        this.logFormIsDisabled.set(false);
        this.userLoginForm.enable();
      });
  }

  // ---------------------------------------------------------------------------------------------- //
  // Сокрытие пароля при вводе
  protected passwordRegFormIsHide = signal<boolean>(true);
  protected hidePasswordRegForm(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.passwordRegFormIsHide.set(!this.passwordRegFormIsHide());
  }
  protected passwordLogFormIsHide = signal<boolean>(true);
  protected hidePasswordLogForm(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.passwordLogFormIsHide.set(!this.passwordLogFormIsHide());
  }

  // ---------------------------------------------------------------------------------------------- //
  // Зацикливание перехода по "Tab"
  @ViewChild('firstLogFormInput') protected firstLogFormInputRef: ElementRef<Element> | undefined;
  @ViewChild('firstRegFormInput') protected firstRegFormInputRef: ElementRef<Element> | undefined;
  protected focusOnFirstInput(focusEl: ElementRef | undefined): void {
    if (focusEl) focusEl.nativeElement.focus();
  }
  protected focusOnFirstInputAlt(
    focusEl: ElementRef | undefined,
    eventTarget: EventTarget | null,
  ): void {
    if (
      focusEl &&
      (eventTarget as Element).parentElement?.nextElementSibling?.attributes.getNamedItem(
        'disabled',
      )
      // ?.lastElementChild?.attributes.getNamedItem('disabled')
    ) {
      focusEl.nativeElement.focus();
    }
  }

  // ---------------------------------------------------------------------------------------------- //
  // Получение резервных значений (для хранения в сервисе)
  ngOnInit(): void {
    // Note: есть разночтение типов FormControl и FormGroup.value.key (undefined),
    // но any в данном случае безопасен, т.к. имеется проверка на соответствие UserRegistrationData
    this.userRegForm.setValue(this.$userDataService.regFormValuesReserv() as any);
  }
  ngOnDestroy() {
    // Резервное сохранение состояния импутов формы регистрации на время жизни сервиса или до выпололнения успешного сценария (на случай непреднамеренного закрытия формы)
    this.$userDataService.setRegFormValuesReserv(this.userRegForm.value as UserRegistrationData);
    // Контрольная очистка подписок, находящихся в сервисе (без этого компонента они не нужны)
    // Тем-не-менее, закрытие данного компонента запрещено (в родителе) при их отработке
    this.$userDataService.clearAuthSubscriptions();
  }
}
