import { TestBed } from '@angular/core/testing';
import { HttpContext, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { of } from 'rxjs';

import getReqCachingInterceptor from './get-req-caching.interceptor';
import { CACHING_ENABLED_TOKEN } from '@global/tokens/http-context-tokens';
import { UserDataService } from '@global/services/user-data-service/user-data.service';

describe('getReqCachingInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => getReqCachingInterceptor(req, next));

  const userName = signal<string | undefined>('ada');

  beforeEach(() => {
    userName.set('ada');
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: UserDataService, useValue: { userName } },
      ],
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

  it('reads the signed-in name when caching is enabled', () => {
    const readName = vi.fn(() => 'ada');
    TestBed.overrideProvider(UserDataService, { useValue: { userName: readName } });
    const next = vi.fn(() => of(new HttpResponse({ status: 200 })));
    const ctx = new HttpContext().set(CACHING_ENABLED_TOKEN, true);

    interceptor(new HttpRequest('GET', '/named', { context: ctx }), next).subscribe();

    expect(readName).toHaveBeenCalled();
  });

  it('with caching token still misses because Map keys are by object reference', () => {
    const next = vi.fn(() => of(new HttpResponse({ status: 200 })));
    const ctx = new HttpContext().set(CACHING_ENABLED_TOKEN, true);
    interceptor(new HttpRequest('GET', '/cache-on', { context: ctx }), next).subscribe();
    interceptor(new HttpRequest('GET', '/cache-on', { context: ctx }), next).subscribe();
    expect(next).toHaveBeenCalledTimes(2);
  });
});
