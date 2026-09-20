import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DownloadProgressInterceptor } from './download-progress.interceptor';

describe('DownloadProgressInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: DownloadProgressInterceptor, multi: true },
      ],
    });
  });

  it('should be created', () => {
    expect(TestBed.inject(HttpClient)).toBeTruthy();
  });
});
