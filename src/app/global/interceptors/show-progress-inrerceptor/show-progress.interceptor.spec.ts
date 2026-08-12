// import { TestBed } from '@angular/core/testing';
// import { HttpInterceptorFn } from '@angular/common/http';
// import { provideZonelessChangeDetection } from '@angular/core';
// import ShowProgressInterceptor from './show-progress.interceptor';

// describe('ShowProgressInterceptor', () => {
//   const interceptor: HttpInterceptorFn = (req, next) =>
//     TestBed.runInInjectionContext(() => new ShowProgressInterceptor(req, next));

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       providers: [provideZonelessChangeDetection()],
//     });
//   });

//   it('should be created', () => {
//     expect(interceptor).toBeTruthy();
//   });
// });

import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ShowProgressInterceptor } from './show-progress.interceptor';

describe('ShowProgressInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ShowProgressInterceptor,
          multi: true,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });
});
