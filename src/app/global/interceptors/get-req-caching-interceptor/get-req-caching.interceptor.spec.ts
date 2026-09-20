import { TestBed } from '@angular/core/testing';
import { HttpContext, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import getReqCachingInterceptor from './get-req-caching.interceptor';
import { CACHING_ENABLED_TOKEN } from '@global/tokens/http-context-tokens';

describe('getReqCachingInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => getReqCachingInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('without CACHING_ENABLED_TOKEN always calls next', () => {
    const next = vi.fn(() => of(new HttpResponse({ status: 200 })));
    const req = new HttpRequest('GET', '/cache-off');
    interceptor(req, next).subscribe();
    interceptor(req, next).subscribe();
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('with caching token still misses because Map keys are by object reference', () => {
    const next = vi.fn(() => of(new HttpResponse({ status: 200 })));
    const ctx = new HttpContext().set(CACHING_ENABLED_TOKEN, true);
    interceptor(new HttpRequest('GET', '/cache-on', { context: ctx }), next).subscribe();
    interceptor(new HttpRequest('GET', '/cache-on', { context: ctx }), next).subscribe();
    expect(next).toHaveBeenCalledTimes(2);
  });
});
