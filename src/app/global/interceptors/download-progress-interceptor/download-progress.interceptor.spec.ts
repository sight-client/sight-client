import { TestBed } from '@angular/core/testing';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DownloadProgressInterceptor } from './download-progress.interceptor';
import { SetProgressSpinnerService } from '@global/services/set-progress-spinner-service/set-progress-spinner.service';

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

  it('turns spinner on for the request and off in finalize', () => {
    const spinner = TestBed.inject(SetProgressSpinnerService);
    const http = TestBed.inject(HttpClient);
    const httpTesting = TestBed.inject(HttpTestingController);

    http.get('/progress').subscribe();
    expect(spinner.isShowSpinner()).toBe(true);

    httpTesting.expectOne('/progress').flush({});
    expect(spinner.isShowSpinner()).toBe(false);
  });
});
