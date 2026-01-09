import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';

import badHtmlInterceptor from './bad-html.interceptor';

describe('badHtmlInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => badHtmlInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});
