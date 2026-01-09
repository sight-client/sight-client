import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import cachingGetReqInterceptor from './caching-get-req.interceptor';

describe('cachingGetReqInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => cachingGetReqInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});
