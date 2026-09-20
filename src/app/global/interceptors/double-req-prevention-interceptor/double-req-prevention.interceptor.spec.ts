import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { of, Subject } from 'rxjs';

import doubleReqPreventionInterceptor from './double-req-prevention.interceptor';

describe('doubleReqPreventionInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => doubleReqPreventionInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('throws on overlapping requests with the same url then allows after finalize', () => {
    const pending = new Subject<HttpResponse<unknown>>();
    const url = `/double-${crypto.randomUUID()}`;
    const req = new HttpRequest('GET', url);
    interceptor(req, () => pending.asObservable()).subscribe();

    expect(() => interceptor(req, () => pending.asObservable()).subscribe()).toThrowError(
      'Double request has canceled',
    );

    pending.next(new HttpResponse({ status: 200 }));
    pending.complete();

    const next = vi.fn(() => of(new HttpResponse({ status: 200 })));
    interceptor(req, next).subscribe();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
