// import { TestBed } from '@angular/core/testing';
// import { HttpInterceptorFn } from '@angular/common/http';
// import { provideZonelessChangeDetection } from '@angular/core';
// import showProgressInterceptor from './show-progress.interceptor';

// describe('showProgressInterceptor', () => {
//   const interceptor: HttpInterceptorFn = (req, next) =>
//     TestBed.runInInjectionContext(() => new showProgressInterceptor(req, next));

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
import { ProgressInterceptor } from './show-progress.interceptor';

describe('MyInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ProgressInterceptor,
          multi: true,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });
});
