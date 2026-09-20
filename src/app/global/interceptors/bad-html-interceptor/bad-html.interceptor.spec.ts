import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

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

  it('GET and DELETE pass through', () => {
    const next = vi.fn(() => of(new HttpResponse({ status: 200 })));
    interceptor(new HttpRequest('GET', '/x'), next).subscribe();
    interceptor(new HttpRequest('DELETE', '/x'), next).subscribe();
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('throws when POST body contains HTML that DOMPurify strips', () => {
    const req = new HttpRequest('POST', '/x', '<img src=x onerror=alert(1)>');
    expect(() =>
      interceptor(req, () => of(new HttpResponse({ status: 200 }))).subscribe(),
    ).toThrowError(/BAD HTML HAS DETECTED/);
  });

  it('POST with plain hello calls next', () => {
    const next = vi.fn(() => of(new HttpResponse({ status: 200 })));
    interceptor(new HttpRequest('POST', '/x', 'hello'), next).subscribe();
    expect(next).toHaveBeenCalled();
  });
});
