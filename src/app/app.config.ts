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
import stopDoubleRequestInterceptor from '@global/interceptors/stop-double-request-interceptor/stop-double-request.interceptor';
import cachingGetReqInterceptor from '@global/interceptors/caching-get-req-interceptor/caching-get-req.interceptor';
// import useApiServProxyInterceptor from '@global/interceptors/use-api-serv-proxy-interceptor/use-api-serv-proxy.interceptor';
import { ShowProgressInterceptor } from '@global/interceptors/show-progress-inrerceptor/show-progress.interceptor';

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
        stopDoubleRequestInterceptor,
        cachingGetReqInterceptor,
        // useApiServProxyInterceptor, // (включить, если будет бэкенд)
      ]),
      withInterceptorsFromDi(), // разрешает провайдить перехватчики в виде классов
    ),
    { provide: HTTP_INTERCEPTORS, useClass: ShowProgressInterceptor, multi: true },
  ],
};
