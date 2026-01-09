import { effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, retry, Subscription } from 'rxjs';
import DOMPurify from 'dompurify';
import chalk from 'chalk';

// Также используется в auth-module.ts
export class UserRegistrationData {
  public login: string | null | undefined; // типизация значений свойств (инпутов) FormGroup (есть разночтение с FormControl)
  public password: string | null | undefined;
  public firstName: string | null | undefined;
  public lastName: string | null | undefined;
  public organization: string | null | undefined;
  public telephone: string | null | undefined;
  public email: string | null | undefined;
  constructor(
    login: string | null | undefined,
    password: string | null | undefined,
    firstName: string | null | undefined,
    lastName: string | null | undefined,
    organization: string | null | undefined,
    telephone: string | null | undefined,
    email: string | null | undefined,
  ) {
    this.login = login;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.organization = organization;
    this.telephone = telephone;
    this.email = email;
  }
}

// Аналог this.userName() для использования в нативных ts-конструкциях, например, caching-get-req.interceptor.ts
let userNameGlobal: string | undefined = '';
// Геттер для него
export function getUserNameGlobal(): string | undefined {
  return userNameGlobal;
}

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private http = inject(HttpClient);
  // Main-сигнал, отслеживаемый многими модулями
  public userName = signal<string | undefined>(undefined);
  constructor() {
    // Автопроверка сессии пользователя
    this.getUserInfoConnection();
    // Новое значение имени пользователя, которое будет использованно, например, caching-get-req.interceptor.ts
    effect(() => {
      if (typeof this.userName() === 'string') {
        userNameGlobal = this.userName() as string;
        this.clearAuthResults(); // плюс очистка состояний сообщений кастомных ошибок
      } else userNameGlobal = undefined;
    });
    // Алерты для извещения пользователя о кастомных ошибках с сервера
    effect(() => {
      if (typeof this.loginResult() === 'string') {
        alert(this.loginResult());
      }
    });
    effect(() => {
      if (typeof this.registrationResult() === 'string') {
        alert(this.registrationResult());
      }
    });
    effect(() => {
      if (typeof this.logoutResult() === 'string') {
        alert(this.logoutResult());
      }
    });
  }
  // Сигналы для информационных сообщений auth-module.ts
  public loginResult = signal<boolean | string | undefined>(undefined);
  public logoutResult = signal<boolean | string | undefined>(undefined);
  public registrationResult = signal<boolean | string | undefined>(undefined);
  public clearAuthResults(): void {
    if (this.logoutResult()) this.logoutResult.set(undefined);
    if (this.loginResult()) this.loginResult.set(undefined);
    if (this.registrationResult()) this.registrationResult.set(undefined);
  }

  // ----------------------------------------------------------------------------------------------------------------- //
  // АВТОРИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ (СОЗДАНИЕ AUTH-СЕССИИ НА СЕРВЕРЕ ПРИЛОЖЕНИЯ)
  declare public loginConnectionSubscription: Subscription;

  // Функция для кнопки в auth-module.ts.
  // Возврат подписки использующему данный сервис компоненту позволит дождаться в нем ее результата, например в .add()-методе (см. auth-module.ts)
  public getLoginSubscription(
    login: string | null | undefined,
    password: string | null | undefined,
  ): Subscription {
    try {
      this.clearAuthResults();
      // Резервная проверка
      if (!login) throw new Error('Empty login!');
      if (!password) throw new Error('Empty password!');
      // Сценарий авторизации нового пользователя при активной сессии другого пользователя
      if (this.userName() && login !== this.userName()) {
        return this.getLogoutObsevable().subscribe((logoutResult: boolean) => {
          if (logoutResult === true) {
            return (this.loginConnectionSubscription = this.getLoginObsevable(
              login,
              password,
            ).subscribe());
          } else {
            this.loginResult.set(
              'Logout before authorization connection failed. Please, try to logout manually.',
            );
            console.log(
              chalk.red(
                'Logout before authorization connection failed. Please, try to logout manually.',
              ),
            );
            return false;
          }
        });
        // Обычный сценарий
      } else {
        return (this.loginConnectionSubscription = this.getLoginObsevable(
          login,
          password,
        ).subscribe());
      }
    } catch (error) {
      this.loginResult.set('Login failed');
      throw error;
    }
  }

  // Обработка результата, необходимого для изменения напрямую причастных к нему состояний, именно в pipe'е
  // позволяет создавать лаконичные цепочки подписок в том числе и для других разнонаправленных целей
  // (см., например местные getLoginSubscription или getRegistrationSubscription).
  private getLoginObsevable(
    login: string | null | undefined,
    password: string | null | undefined,
  ): Observable<boolean> {
    try {
      if (!login) throw new Error('Empty login!');
      if (!password) throw new Error('Empty password!');
      const newAuthHeaders: HttpHeaders = new HttpHeaders().set(
        'Authorization',
        `Basic ${btoa(login)}:${btoa(password)}`,
      );
      // Подобная конструкция запроса предполагает получение в ответе как строки (например, с текстом кастомной ошибки от сервера),
      // так и объекта (обычный сценарий запросов к БД)
      return (
        this.http
          // чанк url '/api' отслеживает use-api-serv-proxy.interceptor.ts
          .get('/api/user/login', {
            headers: newAuthHeaders,
            responseType: 'text' as const,
            withCredentials: true,
          })
          .pipe(
            map((data: string) => {
              try {
                if (data) {
                  // Выдаст ошибку (отсортируется в catch), если в ответе пришла обычная строка (например с текстом кастомной ошибки).
                  // Если же в ответе пришла JSON-образная сущность, она будет успешно распарсена.
                  const parsedRes = JSON.parse(data as string);
                  if (parsedRes === true) {
                    this.loginResult.set(parsedRes);
                    this.userName.set(login);
                    console.log(chalk.green(`User ${login} authorization success`));
                    return true;
                  } else {
                    this.loginResult.set('Invalid data in login connection response');
                    console.log(chalk.red('Invalid data in login connection response'));
                    return false;
                  }
                } else {
                  this.loginResult.set('Empty result in login connection');
                  console.log(chalk.red('Empty result in loginConnection fn'));
                  return false;
                }
                // В данном catch ожидается только запланированная ошибка парсинга строки в JSON
              } catch (_error) {
                if (typeof data === 'string') {
                  // `User's ${session.user} authorization has already valid`
                  // 'User was not registered never before'
                  // `Wrong password for user: ${login}`
                  // `None roles for user: ${login}, authorization failed`
                  this.loginResult.set(data);
                } else {
                  this.loginResult.set('Login failed');
                }
                console.log(chalk.blue(data));
                return false;
              }
            }),
          )
      );
      // Блок под незапланированные системные ошибки (прокидывает ошибку дальше - в подписку)
    } catch (error) {
      throw error;
    }
  }

  // ----------------------------------------------------------------------------------------------------------------- //
  // ВЫХОД ПОЛЬЗОВАТЕЛЯ ИЗ СЕССИИ (на основе данных cookie браузера)
  declare public logoutConnectionSubscription: Subscription;

  // Функция для кнопки в auth-module.ts
  public getLogoutSubscription(): Subscription {
    try {
      this.clearAuthResults();
      return (this.logoutConnectionSubscription = this.getLogoutObsevable().subscribe());
    } catch (error) {
      this.logoutResult.set('Logout failed');
      throw error;
    }
  }

  private getLogoutObsevable(): Observable<boolean> {
    try {
      return this.http
        .get('/api/user/logout', {
          responseType: 'text' as const,
          withCredentials: true,
        })
        .pipe(
          map((data: string) => {
            try {
              if (data) {
                const parsedRes = JSON.parse(data as string); // true
                if (parsedRes === true) {
                  this.logoutResult.set(true);
                  console.log(chalk.green(`User ${this.userName()} logout success`));
                  this.userName.set(undefined);
                  return true;
                } else {
                  this.logoutResult.set('Invalid data in logout connection response');
                  console.log(chalk.red('Invalid data in logout connection response'));
                  return false;
                }
              } else {
                this.logoutResult.set('Empty result in logout connection');
                console.log(chalk.red('Empty result in logoutConnection fn'));
                return false;
              }
            } catch (_error: unknown) {
              if (typeof data === 'string') {
                // 'Logout failed because user is not defined in session storage'
                this.logoutResult.set(data);
              } else {
                this.logoutResult.set('Logout failed');
              }
              console.log(chalk.blue(data));
              return false;
            }
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  // ----------------------------------------------------------------------------------------------------------------- //
  // ПОЛУЧЕНИЕ ИМЕНИ ПОЛЬЗОВАТЕЛЯ ИЗ АКТИВНОЙ СЕССИИ
  declare public userInfoConnectionSubscription: Subscription;

  // Функция для кнопки в auth-module.ts
  public getUserInfoConnection(): Subscription {
    try {
      return (this.userInfoConnectionSubscription = this.getUserInfoObsevable().subscribe());
    } catch (error) {
      if (this.userName()) this.userName.set(undefined);
      throw error;
    }
  }

  private getUserInfoObsevable(): Observable<boolean> {
    try {
      return this.http
        .get('/api/user/info', {
          responseType: 'text' as const,
          withCredentials: true,
        })
        .pipe(
          // retry полезен для автозапросов (без участия пользователя), на случай проблем с коннектом
          retry(2),
          map((data: string) => {
            try {
              if (data) {
                const encodedName: string | null = JSON.parse(data)?.userName;
                if (encodedName) {
                  this.userName.set(atob(encodedName));
                  console.log(chalk.green(`User ${atob(encodedName)} auto authorization success`));
                  return true;
                } else if (encodedName === null) {
                  if (this.userName()) this.userName.set(undefined);
                  console.log(chalk.blue(`Unauthorized user`));
                  return false;
                } else {
                  if (this.userName()) this.userName.set(undefined);
                  console.log(chalk.red('Ivalid data in user info connection response'));
                  return false;
                }
              } else {
                if (this.userName()) this.userName.set(undefined);
                console.log(chalk.red('Empty result in userInfoConnection fn'));
                return false;
              }
            } catch (_error: unknown) {
              if (this.userName()) this.userName.set(undefined);
              // `User's (${session?.user}) groups are absent in session data, auto authorization failed`
              console.log(chalk.blue(data));
              return false;
            }
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  // ----------------------------------------------------------------------------------------------------------------- //
  // РЕГИСТРАЦИЯ В БД НОВОГО ПОЛЬЗОВАТЕЛЯ (С АВТОМАТИЧЕСКОЙ АВТОРИЗАЦИЕЙ)
  declare public registrationConnectionSubscription: Subscription;

  // Функция для кнопки в auth-module.ts
  public getRegistrationSubscription(registrationData: UserRegistrationData): Subscription {
    try {
      // Контрольная проверка на полноту данных
      const bodyEntriesArr = Object.entries(registrationData);
      for (const arr of bodyEntriesArr) {
        if (arr[0] === 'organization' || arr[0] === 'telephone') continue;
        if (!arr[1]) {
          this.registrationResult.set(
            `Empty "${arr[0]}" in registration required data. Registration failed.`,
          );
          throw new Error(`Empty "${arr[0]}" in registration required data. Registration failed.`);
        }
      }
      // Проверка на bad html сохраняемых в БД строковых данных
      const bodyValsArr = Object.values(registrationData);
      for (const item of bodyValsArr) {
        if (typeof item !== 'string') continue; // null не будет проверен и не вызывет ошибку обработки неизвестного DOMPurify типа
        const clean = DOMPurify.sanitize(item);
        if (item !== clean) {
          this.registrationResult.set(
            `BAD HTML HAS DETECTED FROM USER: ${registrationData.login}: ${item}. Registration failed.`,
          );
          throw new Error(
            `BAD HTML HAS DETECTED FROM USER: ${registrationData.login}: ${item}. Registration failed.`,
          );
        }
      }
      // Note: FE позволяет использовать внешний this-контекст
      const getDefaultRegSubscription = (registrationData: UserRegistrationData): Subscription => {
        try {
          return (this.registrationConnectionSubscription = this.getRegistrationObsevable(
            registrationData,
          ).subscribe((regResult: boolean) => {
            if (regResult === true) {
              return (this.loginConnectionSubscription = this.getLoginObsevable(
                registrationData.login,
                registrationData.password,
              ).subscribe((loginResult: boolean) => {
                if (loginResult === true) {
                  this.loginResult.set(true);
                  return true;
                } else {
                  this.loginResult.set(
                    'Login after registration connection failed. Please, try to login manually.',
                  );
                  console.log(
                    chalk.red(
                      'Login after registration connection failed. Please, try to login manually.',
                    ),
                  );
                  // Регистрация, тем-не-менее, выполнена
                  this.registrationResult.set(true);
                  return true;
                }
              }));
            } else return false;
          }));
        } catch (error) {
          throw error;
        }
      };
      this.clearAuthResults();
      // Обычный сценарий
      if (!this.userName()) {
        return getDefaultRegSubscription(registrationData);
        // Сценарий регистрации нового пользователя при активной сессии другого пользователя
      } else {
        return (this.logoutConnectionSubscription = this.getLogoutObsevable().subscribe(
          (logoutResult: boolean) => {
            if (logoutResult === true) {
              return getDefaultRegSubscription(registrationData);
            } else {
              this.registrationResult.set(
                'Logout before registration connection failed. Please, try to logout manually.',
              );
              console.log(
                chalk.red(
                  'Logout before registration connection failed. Please, try to logout manually.',
                ),
              );
              return false;
            }
          },
        ));
      }
    } catch (error) {
      this.registrationResult.set('Registration failed');
      throw error;
    }
  }

  private getRegistrationObsevable(registrationData: UserRegistrationData): Observable<boolean> {
    try {
      if (!registrationData.login) throw new Error('Empty login!');
      if (!registrationData.password) throw new Error('Empty password!');
      const reqBody: UserRegistrationData = structuredClone(registrationData);
      reqBody.login = btoa(registrationData.login);
      reqBody.password = btoa(registrationData.password);
      return this.http
        .post('/api/user/registration', reqBody, {
          // NOTICE:
          // Ответ на post-запрос в Nest.js в настоящее время невозможно НЕ сериализовать в JSON (нельзя вернуть простой текст)
          responseType: 'json' as const,
          withCredentials: true,
        })
        .pipe(
          catchError((err) => {
            // Для ошибок валидации входных данных сетевых запросов с бэка
            if (err?.error?.message && Array.isArray(err?.error?.message)) {
              const validationErrorText: string = `Server's data validation failed: ${err.error.message.join('; ')}`;
              this.registrationResult.set(validationErrorText);
            }
            throw err;
          }),
          map((data: true | { customError?: string }) => {
            try {
              if (data) {
                if (typeof data === 'boolean' && data === true) {
                  this.registrationResult.set(true);
                  console.log(chalk.green(`User ${registrationData.login} registration success`));
                  return true;
                } else if (data?.customError) {
                  this.registrationResult.set(data.customError);
                  // 'Server notice: short password!'
                  // 'User already exists'
                  console.log(chalk.blue(data.customError));
                  return false;
                } else {
                  this.registrationResult.set('Invalid data in registration connection response');
                  console.log(chalk.red('Invalid data in registrationConnection fn'));
                  return false;
                }
              } else {
                this.registrationResult.set('Empty result in registration connection');
                console.log(chalk.red('Empty result in registrationConnection fn'));
                return false;
              }
            } catch (error) {
              throw error;
            }
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  // ----------------------------------------------------------------------------------------------------------------- //
  // Контрольная очистка подписок
  ngOnDestroy() {
    this.clearAuthSubscriptions();
  }
  public clearAuthSubscriptions(): void {
    if (this.logoutConnectionSubscription) {
      this.logoutConnectionSubscription.unsubscribe();
    }
    if (this.loginConnectionSubscription) {
      this.loginConnectionSubscription.unsubscribe();
    }
    if (this.userInfoConnectionSubscription) {
      this.userInfoConnectionSubscription.unsubscribe();
    }
    if (this.registrationConnectionSubscription) {
      this.registrationConnectionSubscription.unsubscribe();
    }
  }

  // ----------------------------------------------------------------------------------------------------------------- //
  // Резервные значения инпутов формы регистрации на случай непреднамеренного закрытия диалога с ней (компонент уничтожается)
  public regFormValuesReserv = signal<UserRegistrationData>(
    new UserRegistrationData('', '', '', '', '', '', ''),
  );
  // Сеттер для резервных значений
  public setRegFormValuesReserv(userRegForm: UserRegistrationData): void {
    this.regFormValuesReserv.set(userRegForm);
  }
  // Очистка вызывается в account-features.ts при успехе авторизации
  public clearRegFormValuesReserv(): void {
    this.regFormValuesReserv.set(new UserRegistrationData('', '', '', '', '', '', ''));
  }
}
