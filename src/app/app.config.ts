import {
  ApplicationConfig,
  // ErrorHandler,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  // withViewTransitions
} from '@angular/router';
import { routes } from './app.routes';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';

// import { GlobalErrorHandlerService } from '@global/services/global-error-handler-service/global-error-handler.service';

import badHtmlInterceptor from '@global/interceptors/bad-html-interceptor/bad-html.interceptor';
import doubleReqPreventionInterceptor from '@global/interceptors/double-req-prevention-interceptor/double-req-prevention.interceptor';
import getReqCachingInterceptor from '@global/interceptors/get-req-caching-interceptor/get-req-caching.interceptor';
// import apiUrlChunkProxyInterceptor from '@global/interceptors/api-url-chunk-proxy-interceptor/api-url-chunk-proxy.interceptor';
import { DownloadProgressInterceptor } from '@global/interceptors/download-progress-interceptor/download-progress.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    // provideRouter(routes, withViewTransitions()), // поддержка анимаций переходов между роутами (включить, когда они будут)
    provideRouter(routes), // заместо строки выше
    // { provide: ErrorHandler, useClass: GlobalErrorHandlerService }, // в планах (кастомный обработчик)

    provideHttpClient(
      // Порядок перехватчиков в массиве имеет значение
      withInterceptors([
        badHtmlInterceptor,
        doubleReqPreventionInterceptor,
        getReqCachingInterceptor,
        // apiUrlChunkProxyInterceptor, // (включить, если будет бэкенд)
      ]),
      withInterceptorsFromDi(), // разрешает провайдить перехватчики в виде классов
    ),
    { provide: HTTP_INTERCEPTORS, useClass: DownloadProgressInterceptor, multi: true },
  ],
};
