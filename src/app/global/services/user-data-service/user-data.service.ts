import { effect, inject, Injectable, signal, untracked } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, concatMap, map, Observable, of, retry, Subscription, throwError } from 'rxjs';
import DOMPurify from 'dompurify';

// Класс, не интерфейс: instanceof остаётся в сборке и может проверить тело запроса.
export class UserRegistrationData {
  public login: string | null | undefined;
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

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private http = inject(HttpClient);
  // Main-сигнал, отслеживаемый многими модулями
  public userName = signal<string | undefined>(undefined);
  public firstname = signal<string | undefined>(undefined);
  public lastname = signal<string | undefined>(undefined);
  constructor() {
    // Автопроверка сессии пользователя
    this.getUserInfoConnection();
    // Новое значение имени пользователя, которое будет использованно, например, get-req-caching.interceptor.ts
    effect(() => {
      if (typeof this.userName() === 'string') {
        untracked(() => {
          this.clearAuthResults();
        });
      }
    });
    // Алерты для извещения пользователя о кастомных ошибках с сервера
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

  public login(
    login: string | null | undefined,
    password: string | null | undefined,
  ): Observable<boolean> {
    this.clearAuthResults();
    if (!login || !password) {
      this.loginResult.set('Login failed');
      return throwError(() => new Error(!login ? 'Empty login!' : 'Empty password!'));
    }
    const signedInAsSomeoneElse = Boolean(this.userName()) && login !== this.userName();
    const start$ = signedInAsSomeoneElse ? this.getLogoutObsevable() : of(true);
    return start$.pipe(
      concatMap((logoutResult) => {
        if (logoutResult !== true) {
          this.loginResult.set(
            'Logout before authorization connection failed. Please, try to logout manually.',
          );
          console.info(
            'Logout before authorization connection failed. Please, try to logout manually.',
          );
          return of(false);
        }
        return this.loginAndLoadUser(login, password);
      }),
    );
  }

  private loginAndLoadUser(login: string, password: string): Observable<boolean> {
    return this.getLoginObsevable(login, password).pipe(
      concatMap((loginResult) => {
        if (loginResult !== true) {
          this.loginResult.set("Login before getting of user's information connection failed.");
          console.info("Login before getting of user's information connection failed.");
          return of(false);
        }
        return this.getUserInfoObsevable().pipe(
          map((userInfoResult) => {
            if (userInfoResult === true) return true;
            this.loginResult.set(
              "Getting of user's information connection failed. Please, try to reload page.",
            );
            console.info(
              "Getting of user's information connection failed. Please, try to reload page.",
            );
            return false;
          }),
        );
      }),
    );
  }

  // Обработка результата, необходимого для изменения напрямую причастных к нему состояний, именно в pipe'е
  // позволяет создавать лаконичные цепочки подписок в том числе и для других разнонаправленных целей
  // (см., например местные getLoginSubscription или getRegistrationSubscription).
  private getLoginObsevable(
    login: string | null | undefined,
    password: string | null | undefined,
  ): Observable<boolean> {
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
          // чанк url '/api' отслеживает api-url-chunk-proxy.interceptor.ts
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
                  const parsedRes: unknown = JSON.parse(data);
                  if (parsedRes === true) {
                    this.loginResult.set(parsedRes);
                    this.userName.set(login);
                    console.info(`User ${login} authorization success`);
                    return true;
                  } else {
                    this.loginResult.set('Invalid data in login connection response');
                    console.info('Invalid data in login connection response');
                    return false;
                  }
                } else {
                  this.loginResult.set('Empty result in login connection');
                  console.info('Empty result in loginConnection fn');
                  return false;
                }
                // В данном catch ожидается только запланированная ошибка парсинга строки в JSON
              } catch (_error: unknown) {
                if (typeof data === 'string') {
                  // `User's ${session.user} authorization has already valid`
                  // 'User was not registered never before'
                  // `Wrong password for user: ${login}`
                  // `None roles for user: ${login}, authorization failed`
                  this.loginResult.set(data);
                } else {
                  this.loginResult.set('Login failed');
                }
                console.info(data);
                return false;
              }
            }),
          )
      );
  }

  // ----------------------------------------------------------------------------------------------------------------- //
  // ВЫХОД ПОЛЬЗОВАТЕЛЯ ИЗ СЕССИИ (на основе данных cookie браузера)
  declare public logoutConnectionSubscription: Subscription;

  public logout(): Observable<boolean> {
    this.clearAuthResults();
    return this.getLogoutObsevable();
  }

  private getLogoutObsevable(): Observable<boolean> {
    return this.http
        .get('/api/user/logout', {
          responseType: 'text' as const,
          withCredentials: true,
        })
        .pipe(
          map((data: string) => {
            try {
              if (data) {
                const parsedRes: unknown = JSON.parse(data);
                if (parsedRes === true) {
                  this.logoutResult.set(true);
                  console.info(`User ${this.userName()} logout success`);
                  this.userName.set(undefined);
                  if (this.firstname()) this.firstname.set(undefined);
                  if (this.lastname()) this.lastname.set(undefined);
                  return true;
                } else {
                  this.logoutResult.set('Invalid data in logout connection response');
                  console.info('Invalid data in logout connection response');
                  return false;
                }
              } else {
                this.logoutResult.set('Empty result in logout connection');
                console.info('Empty result in logoutConnection fn');
                return false;
              }
            } catch (_error: unknown) {
              if (typeof data === 'string') {
                // 'Logout failed because user is not defined in session storage'
                this.logoutResult.set(data);
              } else {
                this.logoutResult.set('Logout failed');
              }
              console.info(data);
              return false;
            }
          }),
        );
  }

  // ----------------------------------------------------------------------------------------------------------------- //
  // ПОЛУЧЕНИЕ ИМЕНИ ПОЛЬЗОВАТЕЛЯ ИЗ АКТИВНОЙ СЕССИИ
  declare public userInfoConnectionSubscription: Subscription;

  // Функция для кнопки в auth-module.ts
  public getUserInfoConnection(): Subscription {
    try {
      return (this.userInfoConnectionSubscription = this.getUserInfoObsevable().subscribe());
    } catch (error: unknown) {
      if (this.userName()) this.userName.set(undefined);
      if (this.firstname()) this.firstname.set(undefined);
      if (this.lastname()) this.lastname.set(undefined);
      throw error;
    }
  }

  private getUserInfoObsevable(): Observable<boolean> {
    if (
        this.userName() !== undefined &&
        this.firstname() !== undefined &&
        this.lastname() !== undefined
      ) {
        return of(true);
      }
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
                const encoded: unknown = JSON.parse(data);
                if (typeof encoded !== 'object' || encoded === null) {
                  this.userName.set(undefined);
                  this.firstname.set(undefined);
                  this.lastname.set(undefined);
                  return false;
                }
                const encodedName =
                  'userName' in encoded && typeof encoded.userName === 'string'
                    ? encoded.userName
                    : null;
                const encodedFirstname =
                  'firstname' in encoded && typeof encoded.firstname === 'string'
                    ? encoded.firstname
                    : null;
                const encodedLastname =
                  'lastname' in encoded && typeof encoded.lastname === 'string'
                    ? encoded.lastname
                    : null;
                if (encodedName) {
                  if (this.userName() === undefined) {
                    console.info(`User ${atob(encodedName)} auto authorization success`);
                  }
                  this.userName.set(atob(encodedName));
                  if (encodedFirstname && encodedLastname) {
                    this.firstname.set(atob(encodedFirstname));
                    this.lastname.set(atob(encodedLastname));
                    // console.log(this.firstname(), this.lastname());
                  }
                  return true;
                } else if (encodedName === null) {
                  if (this.userName()) this.userName.set(undefined);
                  if (this.firstname()) this.firstname.set(undefined);
                  if (this.lastname()) this.lastname.set(undefined);
                  console.info(`Unauthorized user`);
                  return false;
                } else {
                  if (this.userName()) this.userName.set(undefined);
                  if (this.firstname()) this.firstname.set(undefined);
                  if (this.lastname()) this.lastname.set(undefined);
                  console.info('Ivalid data in user info connection response');
                  return false;
                }
              } else {
                if (this.userName()) this.userName.set(undefined);
                if (this.firstname()) this.firstname.set(undefined);
                if (this.lastname()) this.lastname.set(undefined);
                console.info('Empty result in userInfoConnection fn');
                return false;
              }
            } catch (_error: unknown) {
              if (this.userName()) this.userName.set(undefined);
              if (this.firstname()) this.firstname.set(undefined);
              if (this.lastname()) this.lastname.set(undefined);
              // `User's (${session?.user}) groups are absent in session data, auto authorization failed`
              console.info(data);
              return false;
            }
          }),
        );
  }

  // ----------------------------------------------------------------------------------------------------------------- //
  // РЕГИСТРАЦИЯ В БД НОВОГО ПОЛЬЗОВАТЕЛЯ (С АВТОМАТИЧЕСКОЙ АВТОРИЗАЦИЕЙ)
  declare public registrationConnectionSubscription: Subscription;

  public register(registrationData: UserRegistrationData): Observable<boolean> {
    if (!(registrationData instanceof UserRegistrationData)) {
      this.registrationResult.set('Registration failed');
      return throwError(() => new Error('Registration body is not UserRegistrationData'));
    }
    const invalid = this.invalidRegistrationData(registrationData);
    if (invalid) {
      this.registrationResult.set('Registration failed');
      return throwError(() => new Error(invalid));
    }
    this.clearAuthResults();
    const start$ = this.userName() ? this.getLogoutObsevable() : of(true);
    return start$.pipe(
      concatMap((logoutResult) => {
        if (logoutResult !== true) {
          this.registrationResult.set(
            'Logout before registration connection failed. Please, try to logout manually.',
          );
          console.info(
            'Logout before registration connection failed. Please, try to logout manually.',
          );
          return of(false);
        }
        return this.getRegistrationObsevable(registrationData).pipe(
          concatMap((regResult) => {
            if (regResult !== true) return of(false);
            return this.getLoginObsevable(registrationData.login, registrationData.password).pipe(
              map((loginResult) => {
                if (loginResult === true) {
                  this.loginResult.set(true);
                  return true;
                }
                this.loginResult.set(
                  'Login after registration connection failed. Please, try to login manually.',
                );
                console.info(
                  'Login after registration connection failed. Please, try to login manually.',
                );
                this.registrationResult.set(true);
                return true;
              }),
            );
          }),
        );
      }),
    );
  }

  private invalidRegistrationData(registrationData: UserRegistrationData): string | undefined {
    for (const [key, value] of Object.entries(registrationData)) {
      if (key === 'organization' || key === 'telephone') continue;
      if (!value) {
        return `Empty "${key}" in registration required data. Registration failed.`;
      }
    }
    for (const item of Object.values(registrationData)) {
      if (typeof item !== 'string') continue;
      const clean = DOMPurify.sanitize(item);
      if (item !== clean) {
        return `BAD HTML HAS DETECTED FROM USER: ${registrationData.login}: ${item}. Registration failed.`;
      }
    }
    return undefined;
  }

  private getRegistrationObsevable(registrationData: UserRegistrationData): Observable<boolean> {
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
            if (data) {
                if (typeof data === 'boolean' && data === true) {
                  this.registrationResult.set(true);
                  console.info(`User ${registrationData.login} registration success`);
                  return true;
                } else if (data?.customError) {
                  this.registrationResult.set(data.customError);
                  // 'Server notice: short password!'
                  // 'User already exists'
                  console.info(data.customError);
                  return false;
                } else {
                  this.registrationResult.set('Invalid data in registration connection response');
                  console.info('Invalid data in registrationConnection fn');
                  return false;
                }
              } else {
                this.registrationResult.set('Empty result in registration connection');
                console.info('Empty result in registrationConnection fn');
                return false;
              }
          }),
        );
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
  // Очистка вызывается в user-account-features.ts при успехе авторизации
  public clearRegFormValuesReserv(): void {
    this.regFormValuesReserv.set(new UserRegistrationData('', '', '', '', '', '', ''));
  }
}
