import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserDataService } from './user-data.service';

describe('UserDataService', () => {
  let service: UserDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(UserDataService);
    for (const req of httpMock.match(() => true)) {
      req.flush(JSON.stringify({ userName: null }));
    }
  });

  afterEach(() => {
    httpMock.match(() => true).forEach((req) => req.flush(JSON.stringify({ userName: null })));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login without credentials sets Login failed and errors', () => {
    let failed = false;
    service.login('', 'secret').subscribe({ error: () => (failed = true) });
    expect(failed).toBe(true);
    expect(service.loginResult()).toBe('Login failed');
    httpMock.expectNone('/api/user/login');
  });

  it('login after a failed logout does not call login', () => {
    service.userName.set('bob');
    let result: boolean | undefined;
    service.login('ada', 'secret').subscribe((value) => (result = value));

    const logout = httpMock.expectOne('/api/user/logout');
    logout.flush('false');

    expect(result).toBe(false);
    expect(service.loginResult()).toBe(
      'Logout before authorization connection failed. Please, try to logout manually.',
    );
    httpMock.expectNone('/api/user/login');
  });

  it('login then user info sets the user name', () => {
    let result: boolean | undefined;
    service.login('ada', 'secret').subscribe((value) => (result = value));

    httpMock.expectOne('/api/user/login').flush('true');
    httpMock
      .expectOne('/api/user/info')
      .flush(JSON.stringify({ userName: btoa('ada'), firstname: btoa('Ann'), lastname: btoa('Doe') }));

    expect(result).toBe(true);
    expect(service.userName()).toBe('ada');
    expect(service.firstname()).toBe('Ann');
  });
});
